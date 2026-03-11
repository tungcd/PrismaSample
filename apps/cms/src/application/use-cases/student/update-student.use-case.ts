import { studentRepository } from "@/infrastructure/database/repositories/student.repository";
import { UpdateStudentDTO } from "@/domain/repositories/student.repository.interface";
import { StudentEntity } from "@/domain/entities/student.entity";

export class UpdateStudentUseCase {
  async execute(id: string, data: UpdateStudentDTO): Promise<StudentEntity> {
    return studentRepository.update(id, data);
  }
}

export const updateStudentUseCase = new UpdateStudentUseCase();
