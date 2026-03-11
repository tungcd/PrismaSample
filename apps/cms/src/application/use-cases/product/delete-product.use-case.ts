import { IProductRepository } from "@/domain/repositories/product.repository.interface";

export class DeleteProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(id: number): Promise<void> {
    // Check if product exists
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new Error("Product not found");
    }

    await this.productRepository.delete(id);
  }
}
