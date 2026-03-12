import {
  ISupplierRepository,
  CreateSupplierDTO,
} from "@/domain/repositories/supplier.repository.interface";
import { supplierRepository } from "@/infrastructure/database/repositories/supplier.repository";

export class CreateSupplierUseCase {
  constructor(private supplierRepository: ISupplierRepository) {}

  async execute(data: CreateSupplierDTO) {
    return this.supplierRepository.create(data);
  }
}

export const createSupplierUseCase = new CreateSupplierUseCase(
  supplierRepository,
);
