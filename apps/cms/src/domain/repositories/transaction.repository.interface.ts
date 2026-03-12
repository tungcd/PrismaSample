import { TransactionEntity, TransactionType } from "../entities/transaction.entity";

export interface FindTransactionsParams {
  page?: number;
  pageSize?: number;
  walletId?: number;
  userId?: number;  // Filter by user (through wallet)
  type?: TransactionType;
  startDate?: Date;
  endDate?: Date;
  sortBy?: "createdAt" | "amount";
  sortOrder?: "asc" | "desc";
}

export interface ITransactionRepository {
  findMany(params: FindTransactionsParams): Promise<{
    transactions: TransactionEntity[];
    total: number;
  }>;
  findById(id: number): Promise<TransactionEntity | null>;
  count(): Promise<number>;
}
