import { BadRequestException } from "@nestjs/common";
import { DiscountType } from "@smart-canteen/prisma";
import { VouchersService } from "../../src/vouchers/vouchers.service";

describe("VouchersService", () => {
  let service: VouchersService;

  const prisma = {
    voucher: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new VouchersService(prisma as any);
  });

  it("validateCode should throw for invalid voucher", async () => {
    prisma.voucher.findFirst.mockResolvedValue(null);

    await expect(service.validateCode("BAD", 100)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("validateCode should apply percentage with max discount", async () => {
    prisma.voucher.findFirst.mockResolvedValue({
      code: "P10",
      usageLimit: null,
      usageCount: 0,
      minAmount: null,
      discountType: DiscountType.PERCENTAGE,
      discount: 10,
      maxDiscount: 20,
    });

    const result = await service.validateCode("P10", 500);

    expect(result.discountAmount).toBe(20);
    expect(result.finalAmount).toBe(480);
  });

  it("validateCode should apply fixed discount", async () => {
    prisma.voucher.findFirst.mockResolvedValue({
      code: "F50",
      usageLimit: null,
      usageCount: 0,
      minAmount: null,
      discountType: DiscountType.FIXED,
      discount: 50,
      maxDiscount: null,
    });

    const result = await service.validateCode("F50", 120);

    expect(result.discountAmount).toBe(50);
    expect(result.finalAmount).toBe(70);
  });

  it("validateCode should throw when usage limit exceeded", async () => {
    prisma.voucher.findFirst.mockResolvedValue({
      code: "LIM",
      usageLimit: 1,
      usageCount: 1,
      minAmount: null,
      discountType: DiscountType.FIXED,
      discount: 10,
      maxDiscount: null,
    });

    await expect(service.validateCode("LIM", 100)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("validateCode should throw when order amount below minAmount", async () => {
    prisma.voucher.findFirst.mockResolvedValue({
      code: "MIN",
      usageLimit: null,
      usageCount: 0,
      minAmount: 200,
      discountType: DiscountType.FIXED,
      discount: 10,
      maxDiscount: null,
    });

    await expect(service.validateCode("MIN", 100)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("getAvailable should query by active date window", async () => {
    prisma.voucher.findMany.mockResolvedValue([{ id: 1 }]);

    await expect(service.getAvailable()).resolves.toEqual([{ id: 1 }]);
    expect(prisma.voucher.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          deletedAt: null,
        }),
      }),
    );
  });
});
