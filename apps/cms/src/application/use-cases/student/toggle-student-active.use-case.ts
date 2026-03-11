import { studentRepository } from "@/infrastructure/database/repositories/student.repository";
import { StudentEntity } from "@/domain/entities/student.entity";

export class ToggleStudentActiveUseCase {
  async execute(id: number): Promise<StudentEntity> {
    return studentRepository.toggleActive(id);
  }
}

export const toggleStudentActiveUseCase = new ToggleStudentActiveUseCase();
