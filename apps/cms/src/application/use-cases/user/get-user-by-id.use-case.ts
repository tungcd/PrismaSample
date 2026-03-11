import { userRepository } from "@/infrastructure/database/repositories/user.repository";
import { UserEntity } from "@/domain/entities/user.entity";

export class GetUserByIdUseCase {
  async execute(id: string): Promise<UserEntity | null> {
    return userRepository.findById(id);
  }
}

export const getUserByIdUseCase = new GetUserByIdUseCase();
