import { DashboardStatsEntity } from "@/domain/entities/dashboard-stats.entity";
import { dashboardRepository } from "@/infrastructure/database/repositories/dashboard.repository";

export class GetDashboardStatsUseCase {
  async execute(): Promise<DashboardStatsEntity> {
    return dashboardRepository.getStats();
  }
}

export const getDashboardStatsUseCase = new GetDashboardStatsUseCase();
