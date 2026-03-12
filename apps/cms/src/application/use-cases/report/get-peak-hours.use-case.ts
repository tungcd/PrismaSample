import {
  IReportRepository,
  GetPeakHoursParams,
} from "@/domain/repositories/report.repository.interface";
import { PeakHoursEntity } from "@/domain/entities/report.entity";
import { reportRepository } from "@/infrastructure/database/repositories/report.repository";

export class GetPeakHoursUseCase {
  constructor(private reportRepository: IReportRepository) {}

  async execute(params: GetPeakHoursParams): Promise<PeakHoursEntity[]> {
    return await this.reportRepository.getPeakHours(params);
  }
}

export const getPeakHoursUseCase = new GetPeakHoursUseCase(reportRepository);
