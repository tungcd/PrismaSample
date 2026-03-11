import { OrderEntity } from "./order.entity";

export interface DashboardStatsEntity {
  totalUsers: number;
  totalStudents: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  pendingOrders: number;
  recentOrders: OrderEntity[];
}
