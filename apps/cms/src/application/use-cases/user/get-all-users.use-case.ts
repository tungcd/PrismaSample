import { userRepository } from "@/infrastructure/database/repositories/user.repository";
import { UserEntity } from "@/domain/entities/user.entity";

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  email?: string;
  name?: string;
  role?: string;
  phone?: string;
  status?: string;
  sortBy?: "email" | "name" | "role" | "phone";
  sortOrder?: "asc" | "desc";
}

export interface GetUsersResult {
  users: UserEntity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class GetAllUsersUseCase {
  async execute(params: GetUsersParams = {}): Promise<GetUsersResult> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const { users, total } = await userRepository.findMany(params);

    return {
      users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

export const getAllUsersUseCase = new GetAllUsersUseCase();
