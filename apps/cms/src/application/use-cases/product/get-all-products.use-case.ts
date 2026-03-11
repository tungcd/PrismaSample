import { ProductEntity } from "@/domain/entities/product.entity";
import {
  IProductRepository,
  FindProductsParams,
} from "@/domain/repositories/product.repository.interface";

export class GetAllProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(
    params: FindProductsParams,
  ): Promise<{ products: ProductEntity[]; total: number }> {
    return this.productRepository.findMany(params);
  }
}
