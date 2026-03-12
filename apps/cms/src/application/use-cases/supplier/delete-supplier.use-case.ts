import { ISupplierRepository } from "@/domain/repositories/supplier.repository.interface";
import { supplierRepository } from "@/infrastructure/database/repositories/supplier.repository";

export class DeleteSupplierUseCase {
  constructor(private supplierRepository: ISupplierRepository) {}

  async execute(id: number) {
    return this.supplierRepository.delete(id);
  }
}

export const deleteSupplierUseCase = new DeleteSupplierUseCase(
  supplierRepository,
);
