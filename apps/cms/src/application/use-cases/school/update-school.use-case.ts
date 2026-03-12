import { SchoolEntity } from "@/domain/entities/school.entity";
import {
  ISchoolRepository,
  UpdateSchoolDTO,
} from "@/domain/repositories/school.repository.interface";

export class UpdateSchoolUseCase {
  constructor(private schoolRepository: ISchoolRepository) {}

  async execute(id: number, data: UpdateSchoolDTO): Promise<SchoolEntity> {
    return this.schoolRepository.update(id, data);
  }
}
