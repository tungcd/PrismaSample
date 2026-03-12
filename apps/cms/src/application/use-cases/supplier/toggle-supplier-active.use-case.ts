import { ISupplierRepository } from "@/domain/repositories/supplier.repository.interface";
import { supplierRepository } from "@/infrastructure/database/repositories/supplier.repository";

export class ToggleSupplierActiveUseCase {
  constructor(private supplierRepository: ISupplierRepository) {}

  async execute(id: number) {
    return this.supplierRepository.toggleActive(id);
  }
}

export const toggleSupplierActiveUseCase = new ToggleSupplierActiveUseCase(
  supplierRepository,
);
