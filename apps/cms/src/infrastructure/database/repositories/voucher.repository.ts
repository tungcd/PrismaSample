import { prisma } from "@/lib/prisma";
import {
  IVoucherRepository,
  CreateVoucherDTO,
  UpdateVoucherDTO,
  FindVouchersParams,
} from "@/domain/repositories/voucher.repository.interface";
import { VoucherEntity, DiscountType } from "@/domain/entities/voucher.entity";

export class PrismaVoucherRepository implements IVoucherRepository {
  async findMany(params: FindVouchersParams): Promise<{
    vouchers: VoucherEntity[];
    total: number;
  }> {
    const {
      page = 1,
      pageSize = 10,
      code,
      status = "all",
      discountType,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const where: any = {
      deletedAt: null,
    };

    if (code) {
      where.code = {
        contains: code,
        mode: "insensitive",
      };
    }

    if (status !== "all") {
      where.isActive = status === "active";
    }

    if (discountType) {
      where.discountType = discountType;
    }

    const [vouchers, total] = await Promise.all([
      prisma.voucher.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.voucher.count({ where }),
    ]);

    return {
      vouchers: vouchers.map((v) => ({
        ...v,
        discount: Number(v.discount),
        minAmount: v.minAmount ? Number(v.minAmount) : null,
        maxDiscount: v.maxDiscount ? Number(v.maxDiscount) : null,
        discountType: v.discountType as DiscountType,
      })),
      total,
    };
  }

  async findById(id: number): Promise<VoucherEntity | null> {
    const voucher = await prisma.voucher.findFirst({
      where: { id, deletedAt: null },
    });

    if (!voucher) return null;

    return {
      ...voucher,
      discount: Number(voucher.discount),
      minAmount: voucher.minAmount ? Number(voucher.minAmount) : null,
      maxDiscount: voucher.maxDiscount ? Number(voucher.maxDiscount) : null,
      discountType: voucher.discountType as DiscountType,
    };
  }

  async findByCode(code: string): Promise<VoucherEntity | null> {
    const voucher = await prisma.voucher.findFirst({
      where: { code, deletedAt: null },
    });

    if (!voucher) return null;

    return {
      ...voucher,
      discount: Number(voucher.discount),
      minAmount: voucher.minAmount ? Number(voucher.minAmount) : null,
      maxDiscount: voucher.maxDiscount ? Number(voucher.maxDiscount) : null,
      discountType: voucher.discountType as DiscountType,
    };
  }

  async create(data: CreateVoucherDTO): Promise<VoucherEntity> {
    const voucher = await prisma.voucher.create({
      data: {
        code: data.code,
        description: data.description,
        discount: data.discount,
        discountType: data.discountType,
        minAmount: data.minAmount,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit,
        startsAt: data.startsAt,
        expiresAt: data.expiresAt,
        isActive: data.isActive ?? true,
      },
    });

    return {
      ...voucher,
      discount: Number(voucher.discount),
      minAmount: voucher.minAmount ? Number(voucher.minAmount) : null,
      maxDiscount: voucher.maxDiscount ? Number(voucher.maxDiscount) : null,
      discountType: voucher.discountType as DiscountType,
    };
  }

  async update(id: number, data: UpdateVoucherDTO): Promise<VoucherEntity> {
    const voucher = await prisma.voucher.update({
      where: { id },
      data: {
        ...(data.code && { code: data.code }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.discount !== undefined && { discount: data.discount }),
        ...(data.discountType && { discountType: data.discountType }),
        ...(data.minAmount !== undefined && { minAmount: data.minAmount }),
        ...(data.maxDiscount !== undefined && {
          maxDiscount: data.maxDiscount,
        }),
        ...(data.usageLimit !== undefined && { usageLimit: data.usageLimit }),
        ...(data.startsAt && { startsAt: data.startsAt }),
        ...(data.expiresAt && { expiresAt: data.expiresAt }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return {
      ...voucher,
      discount: Number(voucher.discount),
      minAmount: voucher.minAmount ? Number(voucher.minAmount) : null,
      maxDiscount: voucher.maxDiscount ? Number(voucher.maxDiscount) : null,
      discountType: voucher.discountType as DiscountType,
    };
  }

  async delete(id: number): Promise<void> {
    await prisma.voucher.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async toggleActive(id: number): Promise<VoucherEntity> {
    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) throw new Error("Voucher not found");

    const updated = await prisma.voucher.update({
      where: { id },
      data: { isActive: !voucher.isActive },
    });

    return {
      ...updated,
      discount: Number(updated.discount),
      minAmount: updated.minAmount ? Number(updated.minAmount) : null,
      maxDiscount: updated.maxDiscount ? Number(updated.maxDiscount) : null,
      discountType: updated.discountType as DiscountType,
    };
  }

  async count(): Promise<number> {
    return prisma.voucher.count({ where: { deletedAt: null } });
  }
}

export const voucherRepository = new PrismaVoucherRepository();
