import { ProductEntity } from "@/domain/entities/product.entity";
import { IProductRepository } from "@/domain/repositories/product.repository.interface";

export class ToggleProductActiveUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(id: number): Promise<ProductEntity> {
    // Check if product exists
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new Error("Product not found");
    }

    return this.productRepository.toggleActive(id);
  }
}
