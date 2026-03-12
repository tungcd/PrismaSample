import {
  RevenueStatsEntity,
  TopProductEntity,
  UserSpendingEntity,
  PeakHoursEntity,
  SummaryStatsEntity,
} from "../entities/report.entity";

export interface GetRevenueStatsParams {
  period: "daily" | "weekly" | "monthly";
  startDate?: Date;
  endDate?: Date;
}

export interface GetTopProductsParams {
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  sortBy?: "quantity" | "revenue";
}

export interface GetUserSpendingParams {
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  userType?: "PARENT" | "STUDENT";
}

export interface GetPeakHoursParams {
  startDate?: Date;
  endDate?: Date;
}

export interface IReportRepository {
  getRevenueStats(params: GetRevenueStatsParams): Promise<RevenueStatsEntity>;
  getTopProducts(params: GetTopProductsParams): Promise<TopProductEntity[]>;
  getUserSpending(params: GetUserSpendingParams): Promise<UserSpendingEntity[]>;
  getPeakHours(params: GetPeakHoursParams): Promise<PeakHoursEntity[]>;
  getSummaryStats(): Promise<SummaryStatsEntity>;
}
