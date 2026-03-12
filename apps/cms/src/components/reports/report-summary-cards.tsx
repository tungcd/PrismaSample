import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryStatsEntity } from "@/domain/entities/report.entity";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
} from "lucide-react";

interface ReportSummaryCardsProps {
  stats: SummaryStatsEntity;
}

export function ReportSummaryCards({ stats }: ReportSummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const cards = [
    {
      title: "Doanh thu hôm nay",
      value: formatCurrency(stats.todayRevenue),
      subValue: `${stats.todayOrders} đơn hàng`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Doanh thu tuần",
      value: formatCurrency(stats.weekRevenue),
      subValue: `${stats.weekOrders} đơn hàng`,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Doanh thu tháng",
      value: formatCurrency(stats.monthRevenue),
      subValue: `${stats.monthOrders} đơn hàng`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Tổng sản phẩm",
      value: stats.totalProducts.toString(),
      subValue: `${stats.lowStockCount} sắp hết`,
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`rounded-full p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.subValue}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
