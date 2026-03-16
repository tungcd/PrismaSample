import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Role } from "@smart-canteen/prisma";
import { OrdersService } from "../../src/orders/orders.service";

describe("OrdersService", () => {
  let service: OrdersService;

  const prisma = {
    product: {
      findMany: jest.fn(),
    },
    wallet: {
      findUnique: jest.fn(),
    },
    order: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const cartService = {
    getRawItems: jest.fn(),
    clearCart: jest.fn(),
  };

  const vouchersService = {
    validateCode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrdersService(
      prisma as any,
      cartService as any,
      vouchersService as any,
    );
  });

  it("createOrder should throw when no items", async () => {
    await expect(service.createOrder(1, {} as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("createOrder should create order and clear cart when useCart=true", async () => {
    cartService.getRawItems.mockReturnValue([{ productId: 10, quantity: 2 }]);
    prisma.product.findMany.mockResolvedValue([
      { id: 10, name: "Milk", stock: 10, price: 15 },
    ]);
    prisma.wallet.findUnique.mockResolvedValue({
      id: 1,
      userId: 5,
      balance: 100,
    });

    const tx = {
      order: {
        create: jest
          .fn()
          .mockResolvedValue({ id: 22, orderNumber: "ORD-TEST" }),
      },
      wallet: {
        update: jest.fn().mockResolvedValue({}),
      },
      transaction: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

    const result = await service.createOrder(5, { useCart: true } as any);

    expect(cartService.getRawItems).toHaveBeenCalledWith(5);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.order.create).toHaveBeenCalled();
    expect(tx.wallet.update).toHaveBeenCalled();
    expect(tx.transaction.create).toHaveBeenCalled();
    expect(cartService.clearCart).toHaveBeenCalledWith(5);
    expect(result).toEqual({ id: 22, orderNumber: "ORD-TEST" });
  });

  it("findAll should scope to own orders for parent", async () => {
    prisma.order.count.mockResolvedValue(1);
    prisma.order.findMany.mockResolvedValue([{ id: 1 }]);

    await service.findAll(9, Role.PARENT, { page: 1, limit: 10 } as any);

    expect(prisma.order.count).toHaveBeenCalledWith({
      where: { deletedAt: null, userId: 9 },
    });
  });

  it("findOne should throw NotFoundException when order missing", async () => {
    prisma.order.findFirst.mockResolvedValue(null);

    await expect(service.findOne(99, 1, Role.ADMIN)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("findOne should hide other users order for parent", async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 8, userId: 100 });

    await expect(service.findOne(8, 1, Role.PARENT)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("createOrder should throw when product not found", async () => {
    prisma.product.findMany.mockResolvedValue([]);

    await expect(
      service.createOrder(1, {
        items: [{ productId: 10, quantity: 1 }],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("createOrder should throw when stock is insufficient", async () => {
    prisma.product.findMany.mockResolvedValue([
      { id: 10, name: "Milk", stock: 0, price: 15 },
    ]);

    await expect(
      service.createOrder(1, {
        items: [{ productId: 10, quantity: 2 }],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("createOrder should throw when wallet is missing", async () => {
    prisma.product.findMany.mockResolvedValue([
      { id: 10, name: "Milk", stock: 5, price: 15 },
    ]);
    prisma.wallet.findUnique.mockResolvedValue(null);

    await expect(
      service.createOrder(1, {
        items: [{ productId: 10, quantity: 1 }],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("createOrder should throw when wallet balance is insufficient", async () => {
    prisma.product.findMany.mockResolvedValue([
      { id: 10, name: "Milk", stock: 5, price: 50 },
    ]);
    prisma.wallet.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      balance: 10,
    });

    await expect(
      service.createOrder(1, {
        items: [{ productId: 10, quantity: 1 }],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("findAll should apply optional filters", async () => {
    prisma.order.count.mockResolvedValue(0);
    prisma.order.findMany.mockResolvedValue([]);

    await service.findAll(9, Role.ADMIN, {
      page: 2,
      limit: 5,
      status: "PENDING",
      studentId: 20,
      fromDate: "2026-03-01",
      toDate: "2026-03-31",
    } as any);

    expect(prisma.order.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        deletedAt: null,
        status: "PENDING",
        studentId: 20,
      }),
    });
    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 }),
    );
  });

  it("cancelOrder should throw when status is not cancellable", async () => {
    prisma.order.findFirst.mockResolvedValue({
      id: 1,
      userId: 1,
      status: "COMPLETED",
      paymentStatus: "PAID",
      total: 100,
      orderNumber: "ORD-1",
    });

    await expect(service.cancelOrder(1, 1, Role.PARENT)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("cancelOrder should refund wallet when payment was PAID", async () => {
    prisma.order.findFirst.mockResolvedValue({
      id: 1,
      userId: 1,
      status: "PENDING",
      paymentStatus: "PAID",
      total: 100,
      orderNumber: "ORD-1",
    });

    const tx = {
      order: {
        update: jest.fn().mockResolvedValue({ id: 1, status: "CANCELLED" }),
      },
      wallet: {
        findUnique: jest.fn().mockResolvedValue({ id: 7, balance: 10 }),
        update: jest.fn().mockResolvedValue({}),
      },
      transaction: { create: jest.fn().mockResolvedValue({}) },
    };
    prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

    const result = await service.cancelOrder(1, 1, Role.PARENT);

    expect(tx.wallet.update).toHaveBeenCalled();
    expect(tx.transaction.create).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, status: "CANCELLED" });
  });

  it("getTracking should build timeline events", async () => {
    prisma.order.findFirst.mockResolvedValue({
      id: 1,
      userId: 1,
      orderNumber: "ORD-1",
      status: "READY",
      paymentStatus: "PAID",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      approvedAt: new Date("2026-03-01T00:10:00.000Z"),
      preparedAt: null,
      readyAt: new Date("2026-03-01T00:20:00.000Z"),
      completedAt: null,
      cancelledAt: null,
      items: [],
    });

    const result = await service.getTracking(1, 1, Role.PARENT);

    expect(result.events.length).toBe(3);
    expect(result.currentStatus).toBe("READY");
  });

  it("applyVoucher should throw when order already paid", async () => {
    prisma.order.findFirst.mockResolvedValue({
      id: 1,
      userId: 1,
      paymentStatus: "PAID",
    });

    await expect(
      service.applyVoucher(1, 1, Role.PARENT, "ABC"),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("applyVoucher should return preview when valid", async () => {
    prisma.order.findFirst
      .mockResolvedValueOnce({ id: 1, userId: 1, paymentStatus: "PENDING" })
      .mockResolvedValueOnce({ id: 1, orderNumber: "ORD-1", total: 100 });
    vouchersService.validateCode.mockResolvedValue({
      discountAmount: 10,
      finalAmount: 90,
      voucher: { discountType: "FIXED", discount: 10 },
    });

    const result = await service.applyVoucher(1, 1, Role.PARENT, "ABC");

    expect(result.success).toBe(true);
    expect(result.finalTotal).toBe(90);
  });

  it("removeVoucher should throw when order not found", async () => {
    prisma.order.findFirst.mockResolvedValue(null);

    await expect(
      service.removeVoucher(1, 1, Role.PARENT),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("removeVoucher should return success", async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 1, userId: 1 });

    await expect(service.removeVoucher(1, 1, Role.PARENT)).resolves.toEqual({
      success: true,
      message: "Đã gỡ voucher khỏi đơn hàng",
    });
  });
});
