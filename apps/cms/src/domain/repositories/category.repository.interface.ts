import { CategoryEntity } from "../entities/category.entity";

export interface CreateCategoryDTO {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryDTO {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface FindCategoriesParams {
  page?: number;
  pageSize?: number;
  name?: string;
  status?: string; // "all" | "active" | "inactive"
  sortBy?: "name" | "sortOrder" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface ICategoryRepository {
  findMany(params: FindCategoriesParams): Promise<{
    categories: CategoryEntity[];
    total: number;
  }>;
  findById(id: number): Promise<CategoryEntity | null>;
  findBySlug(slug: string): Promise<CategoryEntity | null>;
  create(data: CreateCategoryDTO): Promise<CategoryEntity>;
  update(id: number, data: UpdateCategoryDTO): Promise<CategoryEntity>;
  delete(id: number): Promise<void>;
  toggleActive(id: number): Promise<CategoryEntity>;
  count(): Promise<number>;
}
