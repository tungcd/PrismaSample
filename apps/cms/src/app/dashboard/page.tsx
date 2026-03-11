import { getDashboardStatsUseCase } from "@/application/use-cases/dashboard/get-dashboard-stats.use-case";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "./_components/dashboard-header";
import { DashboardStats } from "./_components/dashboard-stats";
import { RecentOrders } from "./_components/recent-orders";

export default async function DashboardPage() {
  const stats = await getDashboardStatsUseCase.execute();

  return (
    <div className="space-y-8">
      <DashboardHeader />

      <DashboardStats stats={stats} />

      <div className="grid gap-4 md:grid-cols-2">
        <RecentOrders orders={stats.recentOrders} />

        <Card>
          <CardHeader>
            <CardTitle>Thông báo</CardTitle>
            <CardDescription>
              Các thông báo quan trọng cần xử lý
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Không có thông báo mới
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
