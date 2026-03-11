import { userRepository } from "@/infrastructure/database/repositories/user.repository";
import { UserEntity } from "@/domain/entities/user.entity";

export class ToggleUserActiveUseCase {
  async execute(id: number): Promise<UserEntity> {
    return userRepository.toggleActive(id);
  }
}

export const toggleUserActiveUseCase = new ToggleUserActiveUseCase();
