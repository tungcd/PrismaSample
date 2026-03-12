import {
  InventoryTransactionEntity,
  InventoryStatsEntity,
  InventoryType,
} from "../entities/inventory-transaction.entity";

export interface FindInventoryTransactionsParams {
  page?: number;
  pageSize?: number;
  productId?: number;
  type?: InventoryType;
  performedBy?: number;
  startDate?: Date;
  endDate?: Date;
  sortBy?: "createdAt" | "quantity";
  sortOrder?: "asc" | "desc";
}

export interface CreateInventoryTransactionDTO {
  productId: number;
  quantity: number;
  type: InventoryType;
  reason?: string;
  performedBy: number;
}

export interface IInventoryTransactionRepository {
  findMany(
    params: FindInventoryTransactionsParams,
  ): Promise<InventoryTransactionEntity[]>;

  findById(id: number): Promise<InventoryTransactionEntity | null>;

  create(
    data: CreateInventoryTransactionDTO,
  ): Promise<InventoryTransactionEntity>;

  getStats(): Promise<InventoryStatsEntity>;

  count(
    params: Omit<
      FindInventoryTransactionsParams,
      "page" | "pageSize" | "sortBy" | "sortOrder"
    >,
  ): Promise<number>;
}
