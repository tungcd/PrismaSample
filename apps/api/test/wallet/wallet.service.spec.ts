import { WalletService } from "../../src/wallet/wallet.service";

describe("WalletService", () => {
  let service: WalletService;

  const prisma = {
    wallet: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    transaction: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WalletService(prisma as any);
  });

  it("getWallet should create wallet if missing", async () => {
    prisma.wallet.findUnique.mockResolvedValue(null);
    prisma.wallet.create.mockResolvedValue({ id: 1, userId: 10, balance: 0 });

    const result = await service.getWallet(10);

    expect(prisma.wallet.create).toHaveBeenCalledWith({
      data: { userId: 10, balance: 0 },
    });
    expect(result).toEqual({ id: 1, userId: 10, balance: 0 });
  });

  it("getTransactions should return paged response", async () => {
    prisma.wallet.findUnique.mockResolvedValue({ id: 7, userId: 9 });
    prisma.transaction.count.mockResolvedValue(1);
    prisma.transaction.findMany.mockResolvedValue([{ id: 100 }]);

    const result = await service.getTransactions(9, {
      page: 1,
      limit: 10,
      fromDate: "2026-03-01",
      toDate: "2026-03-31",
    });

    expect(prisma.transaction.count).toHaveBeenCalled();
    expect(prisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
      }),
    );
    expect(result.meta.total).toBe(1);
  });

  it("getWallet should return existing wallet", async () => {
    prisma.wallet.findUnique.mockResolvedValue({
      id: 2,
      userId: 20,
      balance: 50,
    });

    const result = await service.getWallet(20);

    expect(prisma.wallet.create).not.toHaveBeenCalled();
    expect(result).toEqual({ id: 2, userId: 20, balance: 50 });
  });

  it("getTransactions should apply transaction type filter", async () => {
    prisma.wallet.findUnique.mockResolvedValue({ id: 7, userId: 9 });
    prisma.transaction.count.mockResolvedValue(0);
    prisma.transaction.findMany.mockResolvedValue([]);

    await service.getTransactions(9, {
      page: 1,
      limit: 20,
      type: "TOP_UP",
    } as any);

    expect(prisma.transaction.count).toHaveBeenCalledWith({
      where: { walletId: 7, type: "TOP_UP" },
    });
  });
});
