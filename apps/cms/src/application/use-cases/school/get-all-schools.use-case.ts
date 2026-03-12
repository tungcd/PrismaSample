import { SchoolEntity } from "@/domain/entities/school.entity";
import {
  ISchoolRepository,
  FindSchoolsParams,
} from "@/domain/repositories/school.repository.interface";

export class GetAllSchoolsUseCase {
  constructor(private schoolRepository: ISchoolRepository) {}

  async execute(
    params: FindSchoolsParams,
  ): Promise<{ schools: SchoolEntity[]; total: number }> {
    return this.schoolRepository.findMany(params);
  }
}
