import {
  IInventoryTransactionRepository,
  CreateInventoryTransactionDTO,
} from "@/domain/repositories/inventory-transaction.repository.interface";
import { InventoryTransactionEntity } from "@/domain/entities/inventory-transaction.entity";
import { inventoryTransactionRepository } from "@/infrastructure/database/repositories/inventory-transaction.repository";

export class CreateInventoryTransactionUseCase {
  constructor(
    private inventoryTransactionRepository: IInventoryTransactionRepository,
  ) {}

  async execute(
    data: CreateInventoryTransactionDTO,
  ): Promise<InventoryTransactionEntity> {
    return await this.inventoryTransactionRepository.create(data);
  }
}

export const createInventoryTransactionUseCase =
  new CreateInventoryTransactionUseCase(inventoryTransactionRepository);
