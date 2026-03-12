import { SchoolEntity } from "@/domain/entities/school.entity";
import { ISchoolRepository } from "@/domain/repositories/school.repository.interface";

export class ToggleSchoolActiveUseCase {
  constructor(private schoolRepository: ISchoolRepository) {}

  async execute(id: number): Promise<SchoolEntity> {
    return this.schoolRepository.toggleActive(id);
  }
}
