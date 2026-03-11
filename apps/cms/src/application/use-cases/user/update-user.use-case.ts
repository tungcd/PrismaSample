import { userRepository } from "@/infrastructure/database/repositories/user.repository";
import { UpdateUserDTO } from "@/domain/repositories/user.repository.interface";
import { UserEntity } from "@/domain/entities/user.entity";

export class UpdateUserUseCase {
  async execute(id: string, data: UpdateUserDTO): Promise<UserEntity> {
    return userRepository.update(id, data);
  }
}

export const updateUserUseCase = new UpdateUserUseCase();
