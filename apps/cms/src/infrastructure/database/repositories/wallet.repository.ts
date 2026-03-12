import { prisma } from "@/lib/prisma";
import {
  IWalletRepository,
  FindWalletsParams,
} from "@/domain/repositories/wallet.repository.interface";
import { WalletEntity } from "@/domain/entities/wallet.entity";
import { Prisma } from "@prisma/client";

export class PrismaWalletRepository implements IWalletRepository {
  async findMany(
    params: FindWalletsParams = {},
  ): Promise<{ wallets: WalletEntity[]; total: number }> {
    const {
      page = 1,
      pageSize = 10,
      userId,
      isLocked,
      minBalance,
      maxBalance,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const where: Prisma.WalletWhereInput = {};

    if (userId !== undefined) {
      where.userId = userId;
    }

    if (isLocked !== undefined) {
      where.isLocked = isLocked;
    }

    if (minBalance !== undefined || maxBalance !== undefined) {
      where.balance = {};
      if (minBalance !== undefined) {
        where.balance.gte = minBalance;
      }
      if (maxBalance !== undefined) {
        where.balance.lte = maxBalance;
      }
    }

    const orderBy: Prisma.WalletOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const skip = (page - 1) * pageSize;

    const [wallets, total] = await Promise.all([
      prisma.wallet.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      prisma.wallet.count({ where }),
    ]);

    return {
      wallets: wallets as any,
      total,
    };
  }

  async findById(id: number): Promise<WalletEntity | null> {
    const wallet = await prisma.wallet.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return wallet as any;
  }

  async findByUserId(userId: number): Promise<WalletEntity | null> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return wallet as any;
  }

  async toggleLock(id: number): Promise<WalletEntity> {
    const wallet = await prisma.wallet.findUnique({
      where: { id },
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const updated = await prisma.wallet.update({
      where: { id },
      data: { isLocked: !wallet.isLocked },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return updated as any;
  }

  async count(): Promise<number> {
    return prisma.wallet.count();
  }
}

export const walletRepository = new PrismaWalletRepository();
