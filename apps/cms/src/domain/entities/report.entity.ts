// Revenue Statistics Entity
export interface RevenueStatsEntity {
  period: "daily" | "weekly" | "monthly";
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  data: RevenueDataPoint[];
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

// Top Product Entity
export interface TopProductEntity {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
}

// User Spending Entity
export interface UserSpendingEntity {
  userId: number;
  userName: string;
  userEmail: string;
  userType: string; // PARENT, STUDENT
  totalSpent: number;
  orderCount: number;
  lastOrderDate: Date | null;
}

// Peak Hours Entity
export interface PeakHoursEntity {
  hour: number;
  orderCount: number;
  revenue: number;
}

// Summary Stats Entity
export interface SummaryStatsEntity {
  todayRevenue: number;
  todayOrders: number;
  weekRevenue: number;
  weekOrders: number;
  monthRevenue: number;
  monthOrders: number;
  totalProducts: number;
  totalUsers: number;
  lowStockCount: number;
}
