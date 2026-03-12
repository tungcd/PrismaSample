import { SchoolEntity } from "@/domain/entities/school.entity";
import {
  ISchoolRepository,
  CreateSchoolDTO,
} from "@/domain/repositories/school.repository.interface";

export class CreateSchoolUseCase {
  constructor(private schoolRepository: ISchoolRepository) {}

  async execute(data: CreateSchoolDTO): Promise<SchoolEntity> {
    return this.schoolRepository.create(data);
  }
}
