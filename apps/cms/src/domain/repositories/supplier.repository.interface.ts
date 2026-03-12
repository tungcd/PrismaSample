import { SupplierEntity } from "../entities/supplier.entity";

export interface CreateSupplierDTO {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface UpdateSupplierDTO {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface FindSuppliersParams {
  page?: number;
  pageSize?: number;
  name?: string;
  status?: string; // "all" | "active" | "inactive"
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface ISupplierRepository {
  findMany(params: FindSuppliersParams): Promise<{
    suppliers: SupplierEntity[];
    total: number;
  }>;
  findById(id: number): Promise<SupplierEntity | null>;
  create(data: CreateSupplierDTO): Promise<SupplierEntity>;
  update(id: number, data: UpdateSupplierDTO): Promise<SupplierEntity>;
  delete(id: number): Promise<void>;
  toggleActive(id: number): Promise<SupplierEntity>;
  count(): Promise<number>;
}
