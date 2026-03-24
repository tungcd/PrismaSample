import { useQuery } from "@tanstack/react-query";
import {
  productsApi,
  categoriesApi,
  ProductFilters,
} from "../api/products.api";

/**
 * Get all products with filters
 */
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productsApi.getAll(filters),
  });
}

/**
 * Get product by ID
 */
export function useProduct(id: number) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getById(id),
    enabled: !!id && id > 0,
  });
}

/**
 * Get featured products
 */
export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productsApi.getFeatured(),
  });
}

/**
 * Get all categories
 */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getAll(),
  });
}

/**
 * Get category by ID
 */
export function useCategory(id: number) {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id && id > 0,
  });
}
