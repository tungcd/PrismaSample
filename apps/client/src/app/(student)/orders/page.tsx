"use client";

import { useState } from "react";
import { useOrders } from "@/lib/hooks/use-orders";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const ORDER_STATUS_CONFIG = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle,
  },
  PREPARING: {
    label: "Đang chuẩn bị",
    color: "bg-purple-100 text-purple-800",
    icon: Package,
  },
  READY: {
    label: "Sẵn sàng",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "bg-gray-100 text-gray-800",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

const STATUS_FILTERS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ", value: "PENDING" },
  { label: "Đã xác nhận", value: "CONFIRMED" },
  { label: "Đang làm", value: "PREPARING" },
  { label: "Sẵn sàng", value: "READY" },
  { label: "Hoàn thành", value: "COMPLETED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filters = statusFilter === "ALL" ? {} : { status: statusFilter as any };
  const { data: ordersData, isLoading, error } = useOrders(filters);
  const orders = ordersData?.data || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-4 space-y-4">
        {/* Status Filter Skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-9 w-24 bg-gray-200 rounded-full animate-pulse"
            />
          ))}
        </div>

        {/* Order Cards Skeleton */}
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-40 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <XCircle className="h-16 w-16 text-red-300 mb-4" />
        <p className="text-lg text-gray-600 mb-2">Không thể tải đơn hàng</p>
        <p className="text-sm text-gray-500">{error.message}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-4 pb-20 space-y-4">
      <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            variant={statusFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(filter.value)}
            className="whitespace-nowrap"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Orders List */}
      {orders && orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order: any) => {
            const statusConfig =
              ORDER_STATUS_CONFIG[
                order.status as keyof typeof ORDER_STATUS_CONFIG
              ];
            const StatusIcon = statusConfig.icon;

            return (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm text-gray-500">
                          Mã đơn: #{order.id}
                        </p>
                        <p
                          className="text-xs text-gray-400 mt-0.5"
                          suppressHydrationWarning
                        >
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <Badge className={statusConfig.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>

                    {/* Items Preview */}
                    <div className="space-y-2 mb-3">
                      {order.items.slice(0, 2).map((item: any) => (
                        <div key={item.id} className="flex gap-2 text-sm">
                          <span className="text-gray-600">
                            {item.quantity}x
                          </span>
                          <span className="flex-1 line-clamp-1">
                            {item.product.name}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-sm text-gray-500">
                          +{order.items.length - 2} món khác
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div>
                        <p className="text-xs text-gray-500">Tổng cộng</p>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Xem chi tiết
                      </Button>
                    </div>

                    {/* Needs Approval Badge */}
                    {order.needsApproval && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                        ⏳ Đang chờ phụ huynh duyệt
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Package className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-lg text-gray-600 mb-2">
            {statusFilter === "ALL"
              ? "Chưa có đơn hàng nào"
              : `Không có đơn hàng ${STATUS_FILTERS.find((f) => f.value === statusFilter)?.label.toLowerCase()}`}
          </p>
          <Link href="/menu">
            <Button className="mt-4">Đặt món ngay</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
