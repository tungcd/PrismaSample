"use server";

import { withRole } from "@/lib/with-auth";
import { productRepository } from "@/infrastructure/database/repositories/product.repository";
import { GetAllProductsUseCase } from "@/application/use-cases/product/get-all-products.use-case";
import { CreateProductUseCase } from "@/application/use-cases/product/create-product.use-case";
import { UpdateProductUseCase } from "@/application/use-cases/product/update-product.use-case";
import { DeleteProductUseCase } from "@/application/use-cases/product/delete-product.use-case";
import { ToggleProductActiveUseCase } from "@/application/use-cases/product/toggle-product-active.use-case";
import {
  CreateProductDTO,
  UpdateProductDTO,
  FindProductsParams,
} from "@/domain/repositories/product.repository.interface";

// Initialize use cases
const getAllProductsUseCase = new GetAllProductsUseCase(productRepository);
const createProductUseCase = new CreateProductUseCase(productRepository);
const updateProductUseCase = new UpdateProductUseCase(productRepository);
const deleteProductUseCase = new DeleteProductUseCase(productRepository);
const toggleProductActiveUseCase = new ToggleProductActiveUseCase(
  productRepository,
);

// Get all products with pagination and filters
export const getAllProductsAction = withRole(
  ["ADMIN", "MANAGER", "STAFF"],
  async (authUser, params: FindProductsParams) => {
    try {
      const result = await getAllProductsUseCase.execute(params);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch products",
      };
    }
  },
);

// Create product
export const createProductAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, data: CreateProductDTO) => {
    try {
      const product = await createProductUseCase.execute(data);
      return { success: true, data: product };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create product",
      };
    }
  },
);

// Update product
export const updateProductAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, id: number, data: UpdateProductDTO) => {
    try {
      const product = await updateProductUseCase.execute(id, data);
      return { success: true, data: product };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update product",
      };
    }
  },
);

// Delete product
export const deleteProductAction = withRole(
  ["ADMIN"],
  async (authUser, id: number) => {
    try {
      await deleteProductUseCase.execute(id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete product",
      };
    }
  },
);

// Toggle product active status
export const toggleProductActiveAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, id: number) => {
    try {
      const product = await toggleProductActiveUseCase.execute(id);
      return { success: true, data: product };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to toggle product status",
      };
    }
  },
);
