import {
  ICategoryRepository,
  CreateCategoryDTO,
} from "@/domain/repositories/category.repository.interface";
import { categoryRepository } from "@/infrastructure/database/repositories/category.repository";

export class CreateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(data: CreateCategoryDTO) {
    return this.categoryRepository.create(data);
  }
}

export const createCategoryUseCase = new CreateCategoryUseCase(
  categoryRepository,
);
