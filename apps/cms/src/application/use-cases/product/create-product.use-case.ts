import { ProductEntity } from "@/domain/entities/product.entity";
import {
  IProductRepository,
  CreateProductDTO,
} from "@/domain/repositories/product.repository.interface";

export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(data: CreateProductDTO): Promise<ProductEntity> {
    // Check if slug already exists
    const existingProduct = await this.productRepository.findBySlug(data.slug);
    if (existingProduct) {
      throw new Error("Slug already exists");
    }

    return this.productRepository.create(data);
  }
}
