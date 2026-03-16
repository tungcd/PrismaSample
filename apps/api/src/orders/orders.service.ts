import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  DiscountType,
  OrderStatus,
  PaymentStatus,
  Role,
  TransactionType,
} from "@smart-canteen/prisma";
import { PrismaService } from "../prisma/prisma.service";
import { CartService } from "../cart/cart.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { QueryOrdersDto } from "./dto/query-orders.dto";
import { VouchersService } from "../vouchers/vouchers.service";

@Injectable()
export class OrdersService {
  private appliedVouchers = new Map<number, string>();

  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private vouchersService: VouchersService,
  ) {}

  private canManageAll(role: Role) {
    return role === Role.ADMIN || role === Role.MANAGER || role === Role.STAFF;
  }

  private assertOrderAccess(orderUserId: number, userId: number, role: Role) {
    if (!this.canManageAll(role) && orderUserId !== userId) {
      throw new NotFoundException("Không tìm thấy đơn hàng");
    }
  }

  async createOrder(userId: number, dto: CreateOrderDto) {
    // Resolve items — from body or from in-memory cart
    let rawItems = dto.items ? [...dto.items] : [];

    if (dto.useCart) {
      const cartItems = this.cartService.getRawItems(userId);
      rawItems = cartItems.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }));
    }

    if (!rawItems.length) {
      throw new BadRequestException("Đơn hàng phải có ít nhất 1 sản phẩm");
    }

    // Validate products exist and are active
    const productIds = rawItems.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true, deletedAt: null },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException(
        "Một số sản phẩm không tồn tại hoặc không còn hoạt động",
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Check stock
    for (const item of rawItems) {
      const product = productMap.get(item.productId)!;
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `${product.name}: chỉ còn ${product.stock} sản phẩm trong kho`,
        );
      }
    }

    // Calculate total
    const total = rawItems.reduce(
      (sum, item) =>
        sum + Number(productMap.get(item.productId)!.price) * item.quantity,
      0,
    );

    // Check wallet
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new BadRequestException("Tài khoản chưa có ví điện tử");
    }

    if (Number(wallet.balance) < total) {
      throw new BadRequestException(
        `Số dư ví không đủ. Cần ${total.toLocaleString("vi-VN")}đ, hiện có ${Number(wallet.balance).toLocaleString("vi-VN")}đ`,
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;

    // Atomic transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const balanceBefore = wallet.balance;

      // Create order with items
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          studentId: dto.studentId ?? null,
          parentId: userId,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PAID,
          total,
          notes: dto.notes ?? null,
          items: {
            create: rawItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: productMap.get(item.productId)!.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, images: true },
              },
            },
          },
          student: { select: { id: true, name: true, grade: true } },
        },
      });

      // Deduct wallet balance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: total } },
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.PURCHASE,
          amount: total,
          balanceBefore,
          balanceAfter: Number(balanceBefore) - total,
          description: `Thanh toán đơn hàng ${orderNumber}`,
          orderId: newOrder.id,
          performedBy: userId,
        },
      });

      return newOrder;
    });

    // Clear cart if used
    if (dto.useCart) {
      this.cartService.clearCart(userId);
    }

    return order;
  }

  async findAll(userId: number, role: Role, query: QueryOrdersDto) {
    const { page = 1, limit = 20, status, studentId, fromDate, toDate } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, any> = { deletedAt: null };

    // Parents and Students only see their own orders
    if (role === Role.PARENT || role === Role.STUDENT) {
      where.userId = userId;
    }

    if (status) where.status = status;
    if (studentId) where.studentId = studentId;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const [total, data] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, images: true } },
            },
          },
          student: { select: { id: true, name: true, grade: true } },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, userId: number, role: Role) {
    const order = await this.prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                category: { select: { id: true, name: true } },
              },
            },
          },
        },
        student: {
          select: { id: true, name: true, grade: true, school: true },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      throw new NotFoundException("Không tìm thấy đơn hàng");
    }

    this.assertOrderAccess(order.userId, userId, role);

    return order;
  }

  async cancelOrder(id: number, userId: number, role: Role) {
    const order = await this.prisma.order.findFirst({
      where: { id, deletedAt: null },
    });

    if (!order) {
      throw new NotFoundException("Không tìm thấy đơn hàng");
    }

    this.assertOrderAccess(order.userId, userId, role);

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        "Đơn hàng không thể hủy ở trạng thái hiện tại",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const cancelled = await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
          paymentStatus:
            order.paymentStatus === PaymentStatus.PAID
              ? PaymentStatus.REFUNDED
              : order.paymentStatus,
        },
      });

      if (order.paymentStatus === PaymentStatus.PAID) {
        const wallet = await tx.wallet.findUnique({
          where: { userId: order.userId },
        });
        if (wallet) {
          await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: Number(order.total) } },
          });

          await tx.transaction.create({
            data: {
              walletId: wallet.id,
              type: TransactionType.REFUND,
              amount: order.total,
              balanceBefore: wallet.balance,
              balanceAfter: Number(wallet.balance) + Number(order.total),
              description: `Hoàn tiền đơn hàng ${order.orderNumber}`,
              orderId: order.id,
              performedBy: userId,
            },
          });
        }
      }

      return cancelled;
    });
  }

  async getTracking(id: number, userId: number, role: Role) {
    const order = await this.findOne(id, userId, role);

    const events = [
      { status: "PENDING", at: order.createdAt, label: "Đơn hàng được tạo" },
      order.approvedAt
        ? {
            status: "CONFIRMED",
            at: order.approvedAt,
            label: "Đơn hàng đã được xác nhận",
          }
        : null,
      order.preparedAt
        ? {
            status: "PREPARING",
            at: order.preparedAt,
            label: "Đơn hàng đang được chuẩn bị",
          }
        : null,
      order.readyAt
        ? { status: "READY", at: order.readyAt, label: "Đơn hàng đã sẵn sàng" }
        : null,
      order.completedAt
        ? {
            status: "COMPLETED",
            at: order.completedAt,
            label: "Đơn hàng đã hoàn thành",
          }
        : null,
      order.cancelledAt
        ? {
            status: "CANCELLED",
            at: order.cancelledAt,
            label: "Đơn hàng đã bị hủy",
          }
        : null,
    ].filter(Boolean);

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      paymentStatus: order.paymentStatus,
      events,
    };
  }

  async reorder(id: number, userId: number, role: Role) {
    const oldOrder = await this.findOne(id, userId, role);

    return this.createOrder(userId, {
      studentId: oldOrder.studentId ?? undefined,
      notes: `Reorder from ${oldOrder.orderNumber}`,
      items: oldOrder.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });
  }

  private async getVoucherPreview(orderId: number, code: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, deletedAt: null },
    });

    if (!order) {
      throw new NotFoundException("Không tìm thấy đơn hàng");
    }

    const amount = Number(order.total);
    const validation = await this.vouchersService.validateCode(code, amount);

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      originalTotal: amount,
      voucherCode: code,
      discountAmount: validation.discountAmount,
      finalTotal: validation.finalAmount,
      discountType: validation.voucher.discountType,
      discountValue:
        validation.voucher.discountType === DiscountType.PERCENTAGE
          ? `${Number(validation.voucher.discount)}%`
          : Number(validation.voucher.discount),
    };
  }

  async applyVoucher(id: number, userId: number, role: Role, code: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, deletedAt: null },
    });

    if (!order) {
      throw new NotFoundException("Không tìm thấy đơn hàng");
    }

    this.assertOrderAccess(order.userId, userId, role);

    if (order.paymentStatus !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        "Chỉ có thể áp dụng voucher trước khi thanh toán",
      );
    }

    const preview = await this.getVoucherPreview(id, code);
    this.appliedVouchers.set(id, code);

    return {
      success: true,
      message: "Áp dụng voucher thành công",
      ...preview,
    };
  }

  async removeVoucher(id: number, userId: number, role: Role) {
    const order = await this.prisma.order.findFirst({
      where: { id, deletedAt: null },
    });

    if (!order) {
      throw new NotFoundException("Không tìm thấy đơn hàng");
    }

    this.assertOrderAccess(order.userId, userId, role);
    this.appliedVouchers.delete(id);

    return {
      success: true,
      message: "Đã gỡ voucher khỏi đơn hàng",
    };
  }
}
