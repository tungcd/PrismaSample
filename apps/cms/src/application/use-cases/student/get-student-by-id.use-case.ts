import { studentRepository } from "@/infrastructure/database/repositories/student.repository";
import { StudentEntity } from "@/domain/entities/student.entity";

export class GetStudentByIdUseCase {
  async execute(id: string): Promise<StudentEntity | null> {
    return studentRepository.findById(id);
  }
}

export const getStudentByIdUseCase = new GetStudentByIdUseCase();
