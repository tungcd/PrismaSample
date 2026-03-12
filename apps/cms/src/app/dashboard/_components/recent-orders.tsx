import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { OrderEntity } from "@/domain/entities/order.entity";
import { formatDate, formatDateTime } from "@/lib/utils/date";

interface RecentOrdersProps {
  orders: OrderEntity[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      PENDING: { label: "Chờ xử lý", class: "bg-yellow-100 text-yellow-800" },
      CONFIRMED: { label: "Đã xác nhận", class: "bg-blue-100 text-blue-800" },
      PREPARING: {
        label: "Đang chuẩn bị",
        class: "bg-purple-100 text-purple-800",
      },
      COMPLETED: { label: "Hoàn thành", class: "bg-green-100 text-green-800" },
      CANCELLED: { label: "Đã hủy", class: "bg-red-100 text-red-800" },
    };

    const status_info = statusMap[status] || {
      label: status,
      class: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${status_info.class}`}
      >
        {status_info.label}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đơn hàng gần đây</CardTitle>
        <CardDescription>
          {orders.length > 0
            ? `${orders.length} đơn hàng mới nhất trong hệ thống`
            : "Chưa có đơn hàng nào"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có đơn hàng nào trong hệ thống
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.user?.name || order.student?.name || "N/A"}
                  </p>
                  <p
                    className="text-xs text-muted-foreground"
                    suppressHydrationWarning
                  >
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium">
                    {formatCurrency(order.total)}
                  </p>
                  {getStatusBadge(order.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
