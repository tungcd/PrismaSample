import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { QueryReportsDto } from "./dto/query-reports.dto";

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private getDateFilter(fromDate?: string, toDate?: string) {
    if (!fromDate && !toDate) return undefined;

    const createdAt: Record<string, Date> = {};
    if (fromDate) createdAt.gte = new Date(fromDate);
    if (toDate) createdAt.lte = new Date(toDate);
    return createdAt;
  }

  async spendingSummary(userId: number, query: QueryReportsDto) {
    const createdAt = this.getDateFilter(query.fromDate, query.toDate);
    const where: Record<string, any> = { userId, deletedAt: null };
    if (query.studentId) where.studentId = query.studentId;
    if (createdAt) where.createdAt = createdAt;

    const orders = await this.prisma.order.findMany({
      where,
      select: { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const byDay: Record<string, number> = {};
    for (const order of orders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      byDay[key] = (byDay[key] ?? 0) + Number(order.total);
    }

    const total = orders.reduce((sum, o) => sum + Number(o.total), 0);

    return {
      total,
      orderCount: orders.length,
      averageOrderValue: orders.length ? total / orders.length : 0,
      byDay,
    };
  }

  async studentConsumption(userId: number, query: QueryReportsDto) {
    const createdAt = this.getDateFilter(query.fromDate, query.toDate);
    const where: Record<string, any> = { userId, deletedAt: null };
    if (query.studentId) where.studentId = query.studentId;
    if (createdAt) where.createdAt = createdAt;

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, grade: true } },
        items: {
          include: { product: { select: { id: true, name: true } } },
        },
      },
    });

    const summary: Record<string, any> = {};

    for (const order of orders) {
      const key = String(order.studentId ?? "unknown");
      if (!summary[key]) {
        summary[key] = {
          student: order.student ?? null,
          totalSpent: 0,
          orderCount: 0,
          totalItems: 0,
        };
      }

      summary[key].totalSpent += Number(order.total);
      summary[key].orderCount += 1;
      summary[key].totalItems += order.items.reduce(
        (s, i) => s + i.quantity,
        0,
      );
    }

    return Object.values(summary);
  }

  async nutritionOverview(userId: number, query: QueryReportsDto) {
    const createdAt = this.getDateFilter(query.fromDate, query.toDate);
    const where: Record<string, any> = { userId, deletedAt: null };
    if (query.studentId) where.studentId = query.studentId;
    if (createdAt) where.createdAt = createdAt;

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                calories: true,
                protein: true,
                carbs: true,
                fat: true,
              },
            },
          },
        },
      },
    });

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    for (const order of orders) {
      for (const item of order.items) {
        const q = item.quantity;
        calories += (item.product.calories ?? 0) * q;
        protein += Number(item.product.protein ?? 0) * q;
        carbs += Number(item.product.carbs ?? 0) * q;
        fat += Number(item.product.fat ?? 0) * q;
      }
    }

    return {
      calories,
      protein,
      carbs,
      fat,
      orderCount: orders.length,
    };
  }
}
