import { SchoolEntity } from "../entities/school.entity";

export interface CreateSchoolDTO {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface UpdateSchoolDTO {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface FindSchoolsParams {
  page?: number;
  pageSize?: number;
  name?: string;
  status?: string; // "all" | "active" | "inactive"
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface ISchoolRepository {
  findMany(params: FindSchoolsParams): Promise<{
    schools: SchoolEntity[];
    total: number;
  }>;
  findById(id: number): Promise<SchoolEntity | null>;
  create(data: CreateSchoolDTO): Promise<SchoolEntity>;
  update(id: number, data: UpdateSchoolDTO): Promise<SchoolEntity>;
  delete(id: number): Promise<void>;
  toggleActive(id: number): Promise<SchoolEntity>;
  count(): Promise<number>;
}
