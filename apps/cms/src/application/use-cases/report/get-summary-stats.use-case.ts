import { IReportRepository } from "@/domain/repositories/report.repository.interface";
import { SummaryStatsEntity } from "@/domain/entities/report.entity";
import { reportRepository } from "@/infrastructure/database/repositories/report.repository";

export class GetSummaryStatsUseCase {
  constructor(private reportRepository: IReportRepository) {}

  async execute(): Promise<SummaryStatsEntity> {
    return await this.reportRepository.getSummaryStats();
  }
}

export const getSummaryStatsUseCase = new GetSummaryStatsUseCase(
  reportRepository,
);
