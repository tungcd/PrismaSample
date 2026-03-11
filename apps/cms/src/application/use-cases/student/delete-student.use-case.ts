import { studentRepository } from "@/infrastructure/database/repositories/student.repository";

export class DeleteStudentUseCase {
  async execute(id: number): Promise<void> {
    return studentRepository.delete(id);
  }
}

export const deleteStudentUseCase = new DeleteStudentUseCase();
