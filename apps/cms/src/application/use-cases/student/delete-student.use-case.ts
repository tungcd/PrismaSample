import { studentRepository } from "@/infrastructure/database/repositories/student.repository";

export class DeleteStudentUseCase {
  async execute(id: string): Promise<void> {
    return studentRepository.delete(id);
  }
}

export const deleteStudentUseCase = new DeleteStudentUseCase();
