"use server";

import { withRole } from "@/lib/with-auth";
import { getAllCategoriesUseCase } from "@/application/use-cases/category/get-all-categories.use-case";
import { createCategoryUseCase } from "@/application/use-cases/category/create-category.use-case";
import { updateCategoryUseCase } from "@/application/use-cases/category/update-category.use-case";
import { deleteCategoryUseCase } from "@/application/use-cases/category/delete-category.use-case";
import { toggleCategoryActiveUseCase } from "@/application/use-cases/category/toggle-category-active.use-case";
import {
  FindCategoriesParams,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "@/domain/repositories/category.repository.interface";

export const getAllCategoriesAction = withRole(
  ["ADMIN"],
  async (authUser, params: FindCategoriesParams = {}) => {
    try {
      const result = await getAllCategoriesUseCase.execute(params);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get categories",
      };
    }
  },
);

export const createCategoryAction = withRole(
  ["ADMIN"],
  async (authUser, data: CreateCategoryDTO) => {
    try {
      const category = await createCategoryUseCase.execute(data);
      return { success: true, data: category };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create category",
      };
    }
  },
);

export const updateCategoryAction = withRole(
  ["ADMIN"],
  async (authUser, id: number, data: UpdateCategoryDTO) => {
    try {
      const category = await updateCategoryUseCase.execute(id, data);
      return { success: true, data: category };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update category",
      };
    }
  },
);

export const deleteCategoryAction = withRole(
  ["ADMIN"],
  async (authUser, id: number) => {
    try {
      await deleteCategoryUseCase.execute(id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete category",
      };
    }
  },
);

export const toggleCategoryActiveAction = withRole(
  ["ADMIN"],
  async (authUser, id: number) => {
    try {
      const category = await toggleCategoryActiveUseCase.execute(id);
      return { success: true, data: category };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to toggle category status",
      };
    }
  },
);
