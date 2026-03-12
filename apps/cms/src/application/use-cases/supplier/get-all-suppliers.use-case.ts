import { ISupplierRepository } from "@/domain/repositories/supplier.repository.interface";
import { supplierRepository } from "@/infrastructure/database/repositories/supplier.repository";

export class GetAllSuppliersUseCase {
  constructor(private supplierRepository: ISupplierRepository) {}

  async execute(params: any) {
    return this.supplierRepository.findMany(params);
  }
}

export const getAllSuppliersUseCase = new GetAllSuppliersUseCase(
  supplierRepository,
);
