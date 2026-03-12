import {
  IInventoryTransactionRepository,
  FindInventoryTransactionsParams,
} from "@/domain/repositories/inventory-transaction.repository.interface";
import { InventoryTransactionEntity } from "@/domain/entities/inventory-transaction.entity";
import { inventoryTransactionRepository } from "@/infrastructure/database/repositories/inventory-transaction.repository";

interface GetInventoryHistoryResult {
  transactions: InventoryTransactionEntity[];
  total: number;
}

export class GetInventoryHistoryUseCase {
  constructor(
    private inventoryTransactionRepository: IInventoryTransactionRepository,
  ) {}

  async execute(
    params: FindInventoryTransactionsParams,
  ): Promise<GetInventoryHistoryResult> {
    const [transactions, total] = await Promise.all([
      this.inventoryTransactionRepository.findMany(params),
      this.inventoryTransactionRepository.count(params),
    ]);

    return {
      transactions,
      total,
    };
  }
}

export const getInventoryHistoryUseCase = new GetInventoryHistoryUseCase(
  inventoryTransactionRepository,
);
