import { ISchoolRepository } from "@/domain/repositories/school.repository.interface";

export class DeleteSchoolUseCase {
  constructor(private schoolRepository: ISchoolRepository) {}

  async execute(id: number): Promise<void> {
    return this.schoolRepository.delete(id);
  }
}
