import { userRepository } from "@/infrastructure/database/repositories/user.repository";

export class DeleteUserUseCase {
  async execute(id: string): Promise<void> {
    return userRepository.delete(id);
  }
}

export const deleteUserUseCase = new DeleteUserUseCase();
