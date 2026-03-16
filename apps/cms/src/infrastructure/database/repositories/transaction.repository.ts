import { prisma } from "@/lib/prisma";
import {
  ITransactionRepository,
  FindTransactionsParams,
} from "@/domain/repositories/transaction.repository.interface";
import { TransactionEntity } from "@/domain/entities/transaction.entity";
import { Prisma } from "@smart-canteen/prisma";

export class PrismaTransactionRepository implements ITransactionRepository {
  async findMany(
    params: FindTransactionsParams = {},
  ): Promise<{ transactions: TransactionEntity[]; total: number }> {
    const {
      page = 1,
      pageSize = 10,
      walletId,
      userId,
      type,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const where: Prisma.TransactionWhereInput = {};

    if (walletId) {
      where.walletId = walletId;
    }

    if (userId) {
      where.wallet = {
        userId: userId,
      };
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const orderBy: Prisma.TransactionOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const skip = (page - 1) * pageSize;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          wallet: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions: transactions as any,
      total,
    };
  }

  async findById(id: number): Promise<TransactionEntity | null> {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        wallet: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return transaction as any;
  }

  async count(): Promise<number> {
    return prisma.transaction.count();
  }
}

export const transactionRepository = new PrismaTransactionRepository();
