import { ICategoryRepository } from "@/domain/repositories/category.repository.interface";
import { categoryRepository } from "@/infrastructure/database/repositories/category.repository";

export class ToggleCategoryActiveUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(id: number) {
    return this.categoryRepository.toggleActive(id);
  }
}

export const toggleCategoryActiveUseCase = new ToggleCategoryActiveUseCase(
  categoryRepository,
);
