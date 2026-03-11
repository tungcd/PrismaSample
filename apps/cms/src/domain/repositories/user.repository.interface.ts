import { UserEntity } from "../entities/user.entity";

export interface CreateUserDTO {
  email: string;
  name: string;
  role: string;
  phone?: string;
  password: string;
}

export interface UpdateUserDTO {
  name?: string;
  role?: string;
  phone?: string;
  avatar?: string;
  password?: string;
}

export interface IUserRepository {
  findAll(): Promise<UserEntity[]>;
  findById(id: string): Promise<UserEntity | null>;
  count(): Promise<number>;
  create(data: CreateUserDTO): Promise<UserEntity>;
  update(id: string, data: UpdateUserDTO): Promise<UserEntity>;
  delete(id: string): Promise<void>;
  toggleActive(id: string): Promise<UserEntity>;
}
