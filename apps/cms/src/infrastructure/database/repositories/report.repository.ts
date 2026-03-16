import { PrismaClient } from "@smart-canteen/prisma";
import {
  IReportRepository,
  GetRevenueStatsParams,
  GetTopProductsParams,
  GetUserSpendingParams,
  GetPeakHoursParams,
} from "@/domain/repositories/report.repository.interface";
import {
  RevenueStatsEntity,
  TopProductEntity,
  UserSpendingEntity,
  PeakHoursEntity,
  SummaryStatsEntity,
} from "@/domain/entities/report.entity";

const prisma = new PrismaClient();

export class PrismaReportRepository implements IReportRepository {
  async getRevenueStats(
    params: GetRevenueStatsParams,
  ): Promise<RevenueStatsEntity> {
    const { period, startDate, endDate } = params;

    // Default date range
    const end = endDate || new Date();
    const start = startDate || this.getStartDate(period, end);

    // Get completed orders in date range
    const orders = await prisma.order.findMany({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        total: true,
        createdAt: true,
      },
    });

    // Group by date
    const grouped = this.groupByPeriod(orders, period);

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      period,
      totalRevenue,
      totalOrders,
      averageOrderValue,
      data: grouped,
    };
  }

  async getTopProducts(
    params: GetTopProductsParams,
  ): Promise<TopProductEntity[]> {
    const { limit = 10, startDate, endDate, sortBy = "revenue" } = params;

    const end = endDate || new Date();
    const start =
      startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          status: "COMPLETED",
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
          },
        },
      },
    });

    // Group by product
    const productMap = new Map<number, TopProductEntity>();

    orderItems.forEach((item) => {
      const productId = item.productId;
      const existing = productMap.get(productId);

      if (existing) {
        existing.totalQuantity += item.quantity;
        existing.totalRevenue += Number(item.price) * item.quantity;
        existing.orderCount += 1;
      } else {
        productMap.set(productId, {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          image: item.product.images?.[0] || null,
          totalQuantity: item.quantity,
          totalRevenue: Number(item.price) * item.quantity,
          orderCount: 1,
        });
      }
    });

    // Convert to array and sort
    const products = Array.from(productMap.values());
    products.sort((a, b) => {
      if (sortBy === "quantity") {
        return b.totalQuantity - a.totalQuantity;
      }
      return b.totalRevenue - a.totalRevenue;
    });

    return products.slice(0, limit);
  }

  async getUserSpending(
    params: GetUserSpendingParams,
  ): Promise<UserSpendingEntity[]> {
    const { limit = 10, startDate, endDate, userType } = params;

    const end = endDate || new Date();
    const start =
      startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const where: any = {
      status: "COMPLETED",
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    if (userType) {
      where.user = {
        role: userType,
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Group by user
    const userMap = new Map<number, UserSpendingEntity>();

    orders.forEach((order) => {
      const userId = order.userId;
      const existing = userMap.get(userId);

      if (existing) {
        existing.totalSpent += Number(order.total);
        existing.orderCount += 1;
        if (
          !existing.lastOrderDate ||
          order.createdAt > existing.lastOrderDate
        ) {
          existing.lastOrderDate = order.createdAt;
        }
      } else {
        userMap.set(userId, {
          userId: order.user.id,
          userName: order.user.name || "Unknown",
          userEmail: order.user.email,
          userType: order.user.role,
          totalSpent: Number(order.total),
          orderCount: 1,
          lastOrderDate: order.createdAt,
        });
      }
    });

    // Convert to array and sort by totalSpent
    const users = Array.from(userMap.values());
    users.sort((a, b) => b.totalSpent - a.totalSpent);

    return users.slice(0, limit);
  }

  async getPeakHours(params: GetPeakHoursParams): Promise<PeakHoursEntity[]> {
    const { startDate, endDate } = params;

    const end = endDate || new Date();
    const start =
      startDate || new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

    const orders = await prisma.order.findMany({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        createdAt: true,
        total: true,
      },
    });

    // Group by hour
    const hourMap = new Map<number, PeakHoursEntity>();

    orders.forEach((order) => {
      const hour = order.createdAt.getHours();
      const existing = hourMap.get(hour);

      if (existing) {
        existing.orderCount += 1;
        existing.revenue += Number(order.total);
      } else {
        hourMap.set(hour, {
          hour,
          orderCount: 1,
          revenue: Number(order.total),
        });
      }
    });

    // Fill missing hours with 0
    const result: PeakHoursEntity[] = [];
    for (let h = 0; h < 24; h++) {
      result.push(
        hourMap.get(h) || {
          hour: h,
          orderCount: 0,
          revenue: 0,
        },
      );
    }

    return result;
  }

  async getSummaryStats(): Promise<SummaryStatsEntity> {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      todayOrders,
      weekOrders,
      monthOrders,
      totalProducts,
      totalUsers,
      lowStockProducts,
    ] = await Promise.all([
      prisma.order.findMany({
        where: {
          status: "COMPLETED",
          createdAt: { gte: todayStart },
        },
        select: { total: true },
      }),
      prisma.order.findMany({
        where: {
          status: "COMPLETED",
          createdAt: { gte: weekStart },
        },
        select: { total: true },
      }),
      prisma.order.findMany({
        where: {
          status: "COMPLETED",
          createdAt: { gte: monthStart },
        },
        select: { total: true },
      }),
      prisma.product.count({
        where: { isActive: true, deletedAt: null },
      }),
      prisma.user.count({
        where: { role: { in: ["PARENT", "STUDENT"] } },
      }),
      prisma.product.count({
        where: {
          isActive: true,
          deletedAt: null,
          stock: { lte: 10 },
        },
      }),
    ]);

    return {
      todayRevenue: todayOrders.reduce((sum, o) => sum + Number(o.total), 0),
      todayOrders: todayOrders.length,
      weekRevenue: weekOrders.reduce((sum, o) => sum + Number(o.total), 0),
      weekOrders: weekOrders.length,
      monthRevenue: monthOrders.reduce((sum, o) => sum + Number(o.total), 0),
      monthOrders: monthOrders.length,
      totalProducts,
      totalUsers,
      lowStockCount: lowStockProducts,
    };
  }

  // Helper methods
  private getStartDate(
    period: "daily" | "weekly" | "monthly",
    end: Date,
  ): Date {
    const start = new Date(end);
    switch (period) {
      case "daily":
        start.setDate(start.getDate() - 30); // Last 30 days
        break;
      case "weekly":
        start.setDate(start.getDate() - 12 * 7); // Last 12 weeks
        break;
      case "monthly":
        start.setMonth(start.getMonth() - 12); // Last 12 months
        break;
    }
    return start;
  }

  private groupByPeriod(
    orders: { createdAt: Date; total: any }[],
    period: "daily" | "weekly" | "monthly",
  ) {
    const grouped = new Map<string, { revenue: number; orders: number }>();

    orders.forEach((order) => {
      const key = this.getDateKey(order.createdAt, period);
      const existing = grouped.get(key);

      if (existing) {
        existing.revenue += Number(order.total);
        existing.orders += 1;
      } else {
        grouped.set(key, {
          revenue: Number(order.total),
          orders: 1,
        });
      }
    });

    return Array.from(grouped.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private getDateKey(
    date: Date,
    period: "daily" | "weekly" | "monthly",
  ): string {
    switch (period) {
      case "daily":
        return date.toISOString().split("T")[0]; // YYYY-MM-DD
      case "weekly":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().split("T")[0];
      case "monthly":
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }
  }
}

export const reportRepository = new PrismaReportRepository();
