import {
  ISupplierRepository,
  UpdateSupplierDTO,
} from "@/domain/repositories/supplier.repository.interface";
import { supplierRepository } from "@/infrastructure/database/repositories/supplier.repository";

export class UpdateSupplierUseCase {
  constructor(private supplierRepository: ISupplierRepository) {}

  async execute(id: number, data: UpdateSupplierDTO) {
    return this.supplierRepository.update(id, data);
  }
}

export const updateSupplierUseCase = new UpdateSupplierUseCase(
  supplierRepository,
);
