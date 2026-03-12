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
  email?: string;
  role?: string;
  phone?: string;
  avatar?: string;
  password?: string;
}

export interface IUserRepository {
  findAll(): Promise<UserEntity[]>;
  findById(id: number): Promise<UserEntity | null>;
  count(): Promise<number>;
  create(data: CreateUserDTO): Promise<UserEntity>;
  update(id: number, data: UpdateUserDTO): Promise<UserEntity>;
  delete(id: number): Promise<void>;
  toggleActive(id: number): Promise<UserEntity>;
}
