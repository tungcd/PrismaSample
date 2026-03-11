import { studentRepository } from "@/infrastructure/database/repositories/student.repository";
import { CreateStudentDTO } from "@/domain/repositories/student.repository.interface";
import { StudentEntity } from "@/domain/entities/student.entity";

export class CreateStudentUseCase {
  async execute(data: CreateStudentDTO): Promise<StudentEntity> {
    return studentRepository.create(data);
  }
}

export const createStudentUseCase = new CreateStudentUseCase();
