"use server";

import { withRole } from "@/lib/with-auth";
import {
  GetRevenueStatsParams,
  GetTopProductsParams,
  GetUserSpendingParams,
  GetPeakHoursParams,
} from "@/domain/repositories/report.repository.interface";
import { getRevenueStatsUseCase } from "@/application/use-cases/report/get-revenue-stats.use-case";
import { getTopProductsUseCase } from "@/application/use-cases/report/get-top-products.use-case";
import { getUserSpendingUseCase } from "@/application/use-cases/report/get-user-spending.use-case";
import { getPeakHoursUseCase } from "@/application/use-cases/report/get-peak-hours.use-case";
import { getSummaryStatsUseCase } from "@/application/use-cases/report/get-summary-stats.use-case";

export const getRevenueStatsAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, params: GetRevenueStatsParams) => {
    try {
      const stats = await getRevenueStatsUseCase.execute(params);
      return { success: true, data: stats };
    } catch (error) {
      console.error("Error getting revenue stats:", error);
      return {
        success: false,
        error: "Failed to get revenue stats",
        data: {
          period: params.period,
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          data: [],
        },
      };
    }
  },
);

export const getTopProductsAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, params: GetTopProductsParams) => {
    try {
      const products = await getTopProductsUseCase.execute(params);
      return { success: true, data: products };
    } catch (error) {
      console.error("Error getting top products:", error);
      return {
        success: false,
        error: "Failed to get top products",
        data: [],
      };
    }
  },
);

export const getUserSpendingAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, params: GetUserSpendingParams) => {
    try {
      const users = await getUserSpendingUseCase.execute(params);
      return { success: true, data: users };
    } catch (error) {
      console.error("Error getting user spending:", error);
      return {
        success: false,
        error: "Failed to get user spending",
        data: [],
      };
    }
  },
);

export const getPeakHoursAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, params: GetPeakHoursParams) => {
    try {
      const hours = await getPeakHoursUseCase.execute(params);
      return { success: true, data: hours };
    } catch (error) {
      console.error("Error getting peak hours:", error);
      return {
        success: false,
        error: "Failed to get peak hours",
        data: [],
      };
    }
  },
);

export const getSummaryStatsAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser) => {
    try {
      const stats = await getSummaryStatsUseCase.execute();
      return { success: true, data: stats };
    } catch (error) {
      console.error("Error getting summary stats:", error);
      return {
        success: false,
        error: "Failed to get summary stats",
        data: {
          todayRevenue: 0,
          todayOrders: 0,
          weekRevenue: 0,
          weekOrders: 0,
          monthRevenue: 0,
          monthOrders: 0,
          totalProducts: 0,
          totalUsers: 0,
          lowStockCount: 0,
        },
      };
    }
  },
);
