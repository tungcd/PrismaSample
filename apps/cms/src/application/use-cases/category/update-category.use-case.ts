import {
  ICategoryRepository,
  UpdateCategoryDTO,
} from "@/domain/repositories/category.repository.interface";
import { categoryRepository } from "@/infrastructure/database/repositories/category.repository";

export class UpdateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(id: number, data: UpdateCategoryDTO) {
    return this.categoryRepository.update(id, data);
  }
}

export const updateCategoryUseCase = new UpdateCategoryUseCase(
  categoryRepository,
);
