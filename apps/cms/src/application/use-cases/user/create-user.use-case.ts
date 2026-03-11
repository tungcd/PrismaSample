import { userRepository } from "@/infrastructure/database/repositories/user.repository";
import { CreateUserDTO } from "@/domain/repositories/user.repository.interface";
import { UserEntity } from "@/domain/entities/user.entity";

export class CreateUserUseCase {
  async execute(data: CreateUserDTO): Promise<UserEntity> {
    return userRepository.create(data);
  }
}

export const createUserUseCase = new CreateUserUseCase();
