import {
  IReportRepository,
  GetRevenueStatsParams,
} from "@/domain/repositories/report.repository.interface";
import { RevenueStatsEntity } from "@/domain/entities/report.entity";
import { reportRepository } from "@/infrastructure/database/repositories/report.repository";

export class GetRevenueStatsUseCase {
  constructor(private reportRepository: IReportRepository) {}

  async execute(params: GetRevenueStatsParams): Promise<RevenueStatsEntity> {
    return await this.reportRepository.getRevenueStats(params);
  }
}

export const getRevenueStatsUseCase = new GetRevenueStatsUseCase(
  reportRepository,
);
