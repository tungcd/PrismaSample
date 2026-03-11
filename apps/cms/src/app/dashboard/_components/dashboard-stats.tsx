import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingCart, Package, DollarSign } from "lucide-react";
import type { DashboardStatsEntity } from "@/domain/entities/dashboard-stats.entity";

interface DashboardStatsProps {
  stats: DashboardStatsEntity;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statsData = [
    {
      title: "Tổng người dùng",
      value: stats.totalUsers,
      icon: Users,
      description: "Người dùng đang hoạt động",
    },
    {
      title: "Học sinh",
      value: stats.totalStudents,
      icon: Users,
      description: "Học sinh đang theo học",
    },
    {
      title: "Đơn hàng",
      value: stats.totalOrders,
      icon: ShoppingCart,
      description: `${stats.pendingOrders} đơn đang chờ xử lý`,
    },
    {
      title: "Sản phẩm",
      value: stats.totalProducts,
      icon: Package,
      description: "Sản phẩm đang bán",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
