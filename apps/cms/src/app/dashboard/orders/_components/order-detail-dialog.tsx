"use client";

import { OrderEntity } from "@/domain/entities/order.entity";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/lib/utils/date";

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderEntity | null;
}

export function OrderDetailDialog({
  open,
  onOpenChange,
  order,
}: OrderDetailDialogProps) {
  if (!order) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };



  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "Chờ xử lý",
      CONFIRMED: "Đã xác nhận",
      PREPARING: "Đang chuẩn bị",
      READY: "Sẵn sàng",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const getPaymentLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "Chưa thanh toán",
      PAID: "Đã thanh toán",
      FAILED: "Thất bại",
      REFUNDED: "Đã hoàn tiền",
    };
    return statusMap[status] || status;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn hàng</DialogTitle>
          <DialogDescription>
            Mã đơn: {order.orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Phụ huynh
              </p>
              <p className="text-sm">{order.user?.name || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{order.user?.email || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Học sinh
              </p>
              <p className="text-sm">
                {order.student
                  ? `${order.student.name} (${order.student.grade})`
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Phương thức TT
              </p>
              <p className="text-sm">{order.paymentMethod}</p>
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Trạng thái đơn hàng
              </p>
              <Badge
                variant={
                  order.status === "COMPLETED"
                    ? "default"
                    : order.status === "CANCELLED"
                      ? "destructive"
                      : "secondary"
                }
              >
                {getStatusLabel(order.status)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Trạng thái thanh toán
              </p>
              <Badge
                variant={
                  order.paymentStatus === "PAID"
                    ? "default"
                    : order.paymentStatus === "FAILED"
                      ? "destructive"
                      : "secondary"
                }
              >
                {getPaymentLabel(order.paymentStatus)}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <p className="text-sm font-medium mb-3">Sản phẩm</p>
            <div className="space-y-2">
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            No img
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {item.product?.name || `Product #${item.productId}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.price)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Không có sản phẩm
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">Tổng cộng</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(order.total)}
            </p>
          </div>

          {/* Notes */}
          {order.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Ghi chú
                </p>
                <p className="text-sm">{order.notes}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Ngày tạo</p>
              <p suppressHydrationWarning>{formatDateTime(order.createdAt)}</p>
            </div>
            {order.preparedAt && (
              <div>
                <p className="text-muted-foreground">Bắt đầu chuẩn bị</p>
                <p suppressHydrationWarning>{formatDateTime(order.preparedAt)}</p>
              </div>
            )}
            {order.readyAt && (
              <div>
                <p className="text-muted-foreground">Sẵn sàng</p>
                <p suppressHydrationWarning>{formatDateTime(order.readyAt)}</p>
              </div>
            )}
            {order.completedAt && (
              <div>
                <p className="text-muted-foreground">Hoàn thành</p>
                <p suppressHydrationWarning>{formatDateTime(order.completedAt)}</p>
              </div>
            )}
            {order.cancelledAt && (
              <div>
                <p className="text-muted-foreground">Đã hủy</p>
                <p suppressHydrationWarning>{formatDateTime(order.cancelledAt)}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
