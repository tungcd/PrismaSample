import { IDashboardRepository } from "../../domain/repositories/dashboard.repository.interface";
import { DashboardStatsEntity } from "../../domain/entities/dashboard-stats.entity";
import { userRepository } from "./user.repository";
import { studentRepository } from "./student.repository";
import { orderRepository } from "./order.repository";
import { productRepository } from "./product.repository";

export class PrismaDashboardRepository implements IDashboardRepository {
  async getStats(): Promise<DashboardStatsEntity> {
    const [
      totalUsers,
      totalStudents,
      totalOrders,
      totalProducts,
      totalRevenue,
      pendingOrders,
      recentOrders,
    ] = await Promise.all([
      userRepository.count(),
      studentRepository.count(),
      orderRepository.count(),
      productRepository.count(),
      orderRepository.calculateTotalRevenue(),
      orderRepository.countByStatus("PENDING"),
      orderRepository.findRecent(10),
    ]);

    return {
      totalUsers,
      totalStudents,
      totalOrders,
      totalProducts,
      totalRevenue,
      pendingOrders,
      recentOrders,
    };
  }
}

export const dashboardRepository = new PrismaDashboardRepository();
