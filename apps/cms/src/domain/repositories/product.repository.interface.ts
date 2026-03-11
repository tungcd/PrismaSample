import { ProductEntity } from "../entities/product.entity";

export interface CreateProductDTO {
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock?: number;
  images?: string[];
  categoryId: number;
  supplierId?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface UpdateProductDTO {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  stock?: number;
  images?: string[];
  categoryId?: number;
  supplierId?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface FindProductsParams {
  page?: number;
  pageSize?: number;
  name?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  stock?: string; // "in_stock" | "low_stock" | "out_of_stock"
  status?: string; // "active" | "inactive"
  isFeatured?: string;
  sortBy?: "name" | "price" | "stock" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface IProductRepository {
  findMany(params: FindProductsParams): Promise<{
    products: ProductEntity[];
    total: number;
  }>;
  findById(id: number): Promise<ProductEntity | null>;
  findBySlug(slug: string): Promise<ProductEntity | null>;
  create(data: CreateProductDTO): Promise<ProductEntity>;
  update(id: number, data: UpdateProductDTO): Promise<ProductEntity>;
  delete(id: number): Promise<void>;
  toggleActive(id: number): Promise<ProductEntity>;
  count(): Promise<number>;
}
