import { ICategoryRepository } from "@/domain/repositories/category.repository.interface";
import { categoryRepository } from "@/infrastructure/database/repositories/category.repository";

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(id: number) {
    return this.categoryRepository.delete(id);
  }
}

export const deleteCategoryUseCase = new DeleteCategoryUseCase(
  categoryRepository,
);
