import { BadRequestException, Injectable } from "@nestjs/common";
import { DiscountType } from "@smart-canteen/prisma";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class VouchersService {
  constructor(private prisma: PrismaService) {}

  async getAvailable() {
    const now = new Date();
    return this.prisma.voucher.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        startsAt: { lte: now },
        expiresAt: { gte: now },
      },
      orderBy: { expiresAt: "asc" },
    });
  }

  async validateCode(code: string, amount: number) {
    const now = new Date();
    const voucher = await this.prisma.voucher.findFirst({
      where: {
        code,
        isActive: true,
        deletedAt: null,
        startsAt: { lte: now },
        expiresAt: { gte: now },
      },
    });

    if (!voucher) {
      throw new BadRequestException("Voucher không hợp lệ hoặc đã hết hạn");
    }

    if (
      voucher.usageLimit !== null &&
      voucher.usageCount >= voucher.usageLimit
    ) {
      throw new BadRequestException("Voucher đã hết lượt sử dụng");
    }

    if (voucher.minAmount && amount < Number(voucher.minAmount)) {
      throw new BadRequestException(
        `Đơn hàng tối thiểu ${Number(voucher.minAmount).toLocaleString("vi-VN")}đ để áp dụng voucher`,
      );
    }

    let discountAmount = 0;
    if (voucher.discountType === DiscountType.PERCENTAGE) {
      discountAmount = (amount * Number(voucher.discount)) / 100;
      if (voucher.maxDiscount) {
        discountAmount = Math.min(discountAmount, Number(voucher.maxDiscount));
      }
    } else {
      discountAmount = Number(voucher.discount);
    }

    discountAmount = Math.max(0, Math.min(discountAmount, amount));

    return {
      valid: true,
      voucher,
      discountAmount,
      finalAmount: amount - discountAmount,
    };
  }
}
