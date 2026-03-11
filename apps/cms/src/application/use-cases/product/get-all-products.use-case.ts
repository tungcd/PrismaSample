import { ProductEntity } from "@/domain/entities/product.entity";
import { productRepository } from "@/infrastructure/database/repositories/product.repository";

export class GetAllProductsUseCase {
  async execute(): Promise<ProductEntity[]> {
    return productRepository.findAll();
  }
}

export const getAllProductsUseCase = new GetAllProductsUseCase();
