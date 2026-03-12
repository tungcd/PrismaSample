import { IInventoryTransactionRepository } from "@/domain/repositories/inventory-transaction.repository.interface";
import { InventoryStatsEntity } from "@/domain/entities/inventory-transaction.entity";
import { inventoryTransactionRepository } from "@/infrastructure/database/repositories/inventory-transaction.repository";

export class GetInventoryStatsUseCase {
  constructor(
    private inventoryTransactionRepository: IInventoryTransactionRepository,
  ) {}

  async execute(): Promise<InventoryStatsEntity> {
    return await this.inventoryTransactionRepository.getStats();
  }
}

export const getInventoryStatsUseCase = new GetInventoryStatsUseCase(
  inventoryTransactionRepository,
);
