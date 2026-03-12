import {
  IOrderRepository,
  FindOrdersParams,
  CreateOrderDTO,
} from "@/domain/repositories/order.repository.interface";
import { prisma } from "../prisma-client";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { OrderEntity } from "@/domain/entities/order.entity";

export class PrismaOrderRepository implements IOrderRepository {
  private mapOrderToEntity(order: any): OrderEntity {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      studentId: order.studentId,
      status: order.status as string,
      paymentStatus: order.paymentStatus as string,
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      preparedAt: order.preparedAt,
      readyAt: order.readyAt,
      completedAt: order.completedAt,
      cancelledAt: order.cancelledAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: order.user,
      student: order.student
        ? {
            ...order.student,
            grade: order.student.grade || "",
          }
        : null,
      items: order.items?.map((item: any) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.price),
        product: item.product,
      })),
    };
  }

  async findMany(
    params: FindOrdersParams = {},
  ): Promise<{ orders: OrderEntity[]; total: number }> {
    const {
      page = 1,
      pageSize = 10,
      orderNumber,
      status,
      paymentStatus,
      userId,
      studentId,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const where: any = { deletedAt: null };

    if (orderNumber) {
      where.orderNumber = { contains: orderNumber, mode: "insensitive" };
    }
    if (status && status !== "all") {
      where.status = status as OrderStatus;
    }
    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = paymentStatus as PaymentStatus;
    }
    if (userId) {
      where.userId = userId;
    }
    if (studentId) {
      where.studentId = studentId;
    }
    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    }
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          student: {
            select: {
              id: true,
              name: true,
              grade: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((order) => this.mapOrderToEntity(order)),
      total,
    };
  }

  async findAll(): Promise<OrderEntity[]> {
    const orders = await prisma.order.findMany({
      where: { deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders.map((order) => this.mapOrderToEntity(order));
  }

  async findById(id: number): Promise<OrderEntity | null> {
    const order = await prisma.order.findUnique({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!order) return null;

    return this.mapOrderToEntity(order);
  }

  async findRecent(limit: number): Promise<OrderEntity[]> {
    const orders = await prisma.order.findMany({
      where: { deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return orders.map((order) => this.mapOrderToEntity(order));
  }

  async count(): Promise<number> {
    return prisma.order.count({
      where: { deletedAt: null },
    });
  }

  async countByStatus(status: string): Promise<number> {
    return prisma.order.count({
      where: {
        deletedAt: null,
        status: status as OrderStatus,
      },
    });
  }

  async calculateTotalRevenue(): Promise<number> {
    const result = await prisma.order.aggregate({
      where: {
        deletedAt: null,
        paymentStatus: PaymentStatus.PAID,
      },
      _sum: {
        total: true,
      },
    });

    return Number(result._sum.total ?? 0);
  }

  async create(data: CreateOrderDTO): Promise<OrderEntity> {
    // Generate unique order number
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;

    // Calculate total
    const total = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: data.userId,
        studentId: data.studentId,
        total,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });

    return this.mapOrderToEntity(order);
  }

  async updateStatus(id: number, status: string): Promise<OrderEntity> {
    const updateData: any = { status: status as OrderStatus };

    // Set timestamps based on status
    const now = new Date();
    switch (status) {
      case "PREPARING":
        updateData.preparedAt = now;
        break;
      case "READY":
        updateData.readyAt = now;
        break;
      case "COMPLETED":
        updateData.completedAt = now;
        updateData.paymentStatus = PaymentStatus.PAID;
        break;
      case "CANCELLED":
        updateData.cancelledAt = now;
        break;
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });

    return this.mapOrderToEntity(order);
  }

  async updatePaymentStatus(
    id: number,
    paymentStatus: string,
  ): Promise<OrderEntity> {
    const order = await prisma.order.update({
      where: { id },
      data: { paymentStatus: paymentStatus as PaymentStatus },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });

    return this.mapOrderToEntity(order);
  }

  async delete(id: number): Promise<void> {
    await prisma.order.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const orderRepository = new PrismaOrderRepository();
