import { api } from "./index";

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: number;
  category?: Category;
  isActive: boolean;
  isFeatured: boolean;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const productsApi = {
  /**
   * Get all products with filters
   */
  getAll: (filters?: ProductFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return api.get<PaginatedResponse<Product>>(
      `/products?${params.toString()}`,
    );
  },

  /**
   * Get product by ID
   */
  getById: (id: number) => api.get<Product>(`/products/${id}`),

  /**
   * Get featured products
   */
  getFeatured: () => api.get<Product[]>("/products?isFeatured=true&limit=10"),
};

export const categoriesApi = {
  /**
   * Get all categories
   */
  getAll: () => api.get<Category[]>("/categories"),

  /**
   * Get category by ID
   */
  getById: (id: number) => api.get<Category>(`/categories/${id}`),
};
