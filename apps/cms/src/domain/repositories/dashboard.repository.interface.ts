import { DashboardStatsEntity } from "../entities/dashboard-stats.entity";

export interface IDashboardRepository {
  getStats(): Promise<DashboardStatsEntity>;
}
