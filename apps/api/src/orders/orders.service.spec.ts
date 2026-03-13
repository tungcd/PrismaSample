import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Role } from "@prisma/client";
import { OrdersService } from "./orders.service";

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
});
