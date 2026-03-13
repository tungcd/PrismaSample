"use client";

import { useRouter } from "next/navigation";
import {
  useOrder,
  useOrderTracking,
  useCancelOrder,
  useReorder,
} from "@/lib/hooks/use-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  User,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Tag,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const orderId = parseInt(id, 10);
  const { data: order, isLoading: orderLoading } = useOrder(orderId);
  const { data: tracking, isLoading: trackingLoading } =
    useOrderTracking(orderId);
  const cancelOrder = useCancelOrder();
  const reorderMutation = useReorder();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date),
      time: new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date),
    };
  };

  const handleCancelOrder = async () => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

    try {
      await cancelOrder.mutateAsync(orderId);
      toast.success("Đã hủy đơn hàng thành công");
    } catch (error: any) {
      toast.error(error.message || "Không thể hủy đơn hàng");
    }
  };

  const handleReorder = async () => {
    try {
      await reorderMutation.mutateAsync(orderId);
      toast.success("Đã thêm các món vào giỏ hàng");
      router.push("/cart");
    } catch (error: any) {
      toast.error(error.message || "Không thể đặt lại đơn hàng");
    }
  };

  if (orderLoading) {
    return (
      <div className="container max-w-2xl py-4 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container max-w-2xl py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <Package className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-lg text-gray-600 mb-4">Không tìm thấy đơn hàng</p>
        <Link href="/orders">
          <Button>Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  const statusConfig =
    ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG];
  const StatusIcon = statusConfig.icon;
  const canCancel = order.status === "PENDING";
  const canReorder =
    order.status === "COMPLETED" || order.status === "CANCELLED";

  return (
    <div className="container max-w-2xl py-4 pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">
            Đơn hàng #{String(order.id).padStart(8, "0")}
          </h1>
          <p className="text-sm text-gray-500" suppressHydrationWarning>
            {formatDateTime(order.createdAt).date} •{" "}
            {formatDateTime(order.createdAt).time}
          </p>
        </div>
        <Badge className={statusConfig.color}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {statusConfig.label}
        </Badge>
      </div>

      {/* Needs Approval Alert */}
      {order.needsApproval && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">
                  Chờ phụ huynh duyệt
                </p>
                <p className="text-sm text-amber-600 mt-1">
                  Đơn hàng này vượt quá hạn mức chi tiêu và cần được phụ huynh
                  duyệt trước khi xử lý.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracking Timeline */}
      {tracking && tracking.timeline && tracking.timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trạng thái đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tracking.timeline.map((event: any, index: number) => {
                const isLast = index === tracking.timeline.length - 1;
                const dt = formatDateTime(event.timestamp);

                return (
                  <div key={index} className="flex gap-3">
                    {/* Timeline dot and line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${isLast ? "bg-primary" : "bg-gray-300"}`}
                      />
                      {!isLast && (
                        <div className="w-0.5 h-full bg-gray-200 mt-1" />
                      )}
                    </div>

                    {/* Event content */}
                    <div className="flex-1 pb-4">
                      <p
                        className={`font-medium ${isLast ? "text-primary" : "text-gray-700"}`}
                      >
                        {event.status}
                      </p>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-0.5">
                          {event.description}
                        </p>
                      )}
                      <p
                        className="text-xs text-gray-400 mt-1"
                        suppressHydrationWarning
                      >
                        {dt.date} • {dt.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chi tiết đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {item.product.image ? (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    🍽️
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium line-clamp-1">{item.product.name}</p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(item.price)} × {item.quantity}
                </p>
              </div>
              <div className="text-right font-medium">
                {formatCurrency(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Student Info (if parent made the order) */}
      {order.student && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Học sinh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{order.student.name}</p>
            {order.student.grade && (
              <p className="text-sm text-gray-600">Lớp {order.student.grade}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order Notes */}
      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ghi chú</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{order.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Voucher Info */}
      {order.voucher && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Mã giảm giá
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{order.voucher.code}</p>
            <p className="text-sm text-gray-600">{order.voucher.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thanh toán</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tạm tính</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Giảm giá</span>
              <span>- {formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Tổng cộng</span>
            <span className="text-primary">{formatCurrency(order.total)}</span>
          </div>
          <div className="flex justify-between text-sm pt-1">
            <span className="text-gray-600">Trạng thái thanh toán</span>
            <Badge
              variant={order.paymentStatus === "PAID" ? "default" : "secondary"}
            >
              {order.paymentStatus === "PAID"
                ? "Đã thanh toán"
                : order.paymentStatus === "PENDING"
                  ? "Chờ thanh toán"
                  : order.paymentStatus === "FAILED"
                    ? "Thất bại"
                    : "Đã hoàn tiền"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {canCancel && (
          <Button
            variant="destructive"
            onClick={handleCancelOrder}
            disabled={cancelOrder.isPending}
            className="flex-1"
          >
            {cancelOrder.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang hủy...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Hủy đơn
              </>
            )}
          </Button>
        )}
        {canReorder && (
          <Button
            variant="outline"
            onClick={handleReorder}
            disabled={reorderMutation.isPending}
            className="flex-1"
          >
            {reorderMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Đặt lại
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
