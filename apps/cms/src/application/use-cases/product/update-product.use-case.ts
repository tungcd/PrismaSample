import { ProductEntity } from "@/domain/entities/product.entity";
import {
  IProductRepository,
  UpdateProductDTO,
} from "@/domain/repositories/product.repository.interface";

export class UpdateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(id: number, data: UpdateProductDTO): Promise<ProductEntity> {
    // Check if product exists
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new Error("Product not found");
    }

    // Check if slug is being changed and already exists
    if (data.slug && data.slug !== existingProduct.slug) {
      const productWithSlug = await this.productRepository.findBySlug(
        data.slug,
      );
      if (productWithSlug) {
        throw new Error("Slug already exists");
      }
    }

    return this.productRepository.update(id, data);
  }
}
