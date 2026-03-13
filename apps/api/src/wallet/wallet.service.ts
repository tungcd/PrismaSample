import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { QueryWalletTransactionsDto } from "./dto/query-wallet-transactions.dto";

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  private async ensureWallet(userId: number) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (wallet) return wallet;
    return this.prisma.wallet.create({ data: { userId, balance: 0 } });
  }

  async getWallet(userId: number) {
    return this.ensureWallet(userId);
  }

  async getTransactions(userId: number, query: QueryWalletTransactionsDto) {
    const wallet = await this.ensureWallet(userId);
    const { page = 1, limit = 20, type, fromDate, toDate } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, any> = { walletId: wallet.id };
    if (type) where.type = type;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const [total, data] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
}
