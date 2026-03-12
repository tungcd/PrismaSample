import { ICategoryRepository } from "@/domain/repositories/category.repository.interface";
import { categoryRepository } from "@/infrastructure/database/repositories/category.repository";

export class GetAllCategoriesUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(params: any) {
    return this.categoryRepository.findMany(params);
  }
}

export const getAllCategoriesUseCase = new GetAllCategoriesUseCase(
  categoryRepository,
);
