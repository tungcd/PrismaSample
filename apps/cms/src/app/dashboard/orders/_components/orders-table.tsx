"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { OrderEntity } from "@/domain/entities/order.entity";
import type { GetOrdersResult } from "@/application/use-cases/order/get-orders.use-case";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import type {
  DataTableConfig,
  PaginatedResult,
} from "@/types/data-table.types";
import { Eye, Trash2, CheckCircle, XCircle } from "lucide-react";
import { deleteOrderAction, updateOrderStatusAction } from "../actions";
import { OrderDetailDialog } from "./order-detail-dialog";
import { toast } from "sonner";

interface OrdersTableProps {
  data: GetOrdersResult;
}

const ORDER_STATUSES = [
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "PREPARING", label: "Đang chuẩn bị" },
  { value: "READY", label: "Sẵn sàng" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const PAYMENT_STATUSES = [
  { value: "PENDING", label: "Chưa thanh toán" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "FAILED", label: "Thất bại" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
];

export function OrdersTable({ data }: OrdersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderEntity | null>(null);

  const handleViewDetail = (order: OrderEntity) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };

  const handleComplete = async (order: OrderEntity) => {
    if (
      !confirm(
        `Xác nhận hoàn thành đơn hàng ${order.orderNumber}? Đơn hàng sẽ được đánh dấu HOÀN THÀNH và THANH TOÁN.`,
      )
    )
      return;

    const result = await updateOrderStatusAction(order.id, "COMPLETED");
    if (result.success) {
      toast.success("Cập nhật đơn hàng thành công");
      startTransition(() => {
        router.refresh();
      });
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  const handleCancel = async (order: OrderEntity) => {
    if (!confirm(`Xác nhận HỦY đơn hàng ${order.orderNumber}?`)) return;

    const result = await updateOrderStatusAction(order.id, "CANCELLED");
    if (result.success) {
      toast.success("Hủy đơn hàng thành công");
      startTransition(() => {
        router.refresh();
      });
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (order: OrderEntity) => {
    if (!confirm(`Bạn có chắc muốn xóa đơn hàng ${order.orderNumber}?`))
      return;

    const result = await deleteOrderAction(order.id);
    if (result.success) {
      toast.success("Xóa đơn hàng thành công");
      startTransition(() => {
        router.refresh();
      });
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
    > = {
      PENDING: { variant: "secondary", label: "Chờ xử lý" },
      CONFIRMED: { variant: "default", label: "Đã xác nhận" },
      PREPARING: { variant: "default", label: "Đang chuẩn bị" },
      READY: { variant: "default", label: "Sẵn sàng" },
      COMPLETED: { variant: "default", label: "Hoàn thành" },
      CANCELLED: { variant: "destructive", label: "Đã hủy" },
    };

    const config = statusConfig[status] || {
      variant: "outline" as const,
      label: status,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
    > = {
      PENDING: { variant: "secondary", label: "Chưa TT" },
      PAID: { variant: "default", label: "Đã TT" },
      FAILED: { variant: "destructive", label: "Thất bại" },
      REFUNDED: { variant: "outline", label: "Hoàn tiền" },
    };

    const config = statusConfig[status] || {
      variant: "outline" as const,
      label: status,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Transform GetOrdersResult to PaginatedResult
  const result: PaginatedResult<OrderEntity> = {
    data: data.orders,
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
    totalPages: data.totalPages,
  };

  // Configure table columns and behavior
  const tableConfig: DataTableConfig<OrderEntity> = {
    entityName: "đơn hàng",
    columns: [
      {
        key: "orderNumber",
        label: "Mã đơn",
        sortable: true,
        filterable: true,
        filter: {
          type: "text",
          placeholder: "Tìm mã đơn...",
        },
        className: "font-medium font-mono",
      },
      {
        key: "user",
        label: "Phụ huynh",
        render: (order) => order.user?.name || "-",
      },
      {
        key: "student",
        label: "Học sinh",
        render: (order) =>
          order.student ? (
            <div className="flex flex-col">
              <span>{order.student.name}</span>
              <span className="text-xs text-muted-foreground">
                {order.student.grade}
              </span>
            </div>
          ) : (
            "-"
          ),
      },
      {
        key: "total",
        label: "Tổng tiền",
        sortable: true,
        render: (order) => (
          <span className="font-medium">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(order.total)}
          </span>
        ),
      },
      {
        key: "status",
        label: "Trạng thái",
        filterable: true,
        filter: {
          type: "select",
          options: ORDER_STATUSES.map((s) => ({ value: s.value, label: s.label })),
        },
        render: (order) => getStatusBadge(order.status),
      },
      {
        key: "paymentStatus",
        label: "Thanh toán",
        filterable: true,
        filter: {
          type: "select",
          options: PAYMENT_STATUSES.map((s) => ({
            value: s.value,
            label: s.label,
          })),
        },
        render: (order) => getPaymentBadge(order.paymentStatus),
      },
      {
        key: "createdAt",
        label: "Ngày tạo",
        sortable: true,
        render: (order) => {
          const date = new Date(order.createdAt);
          return (
            <span className="text-sm">
              {date.toLocaleDateString("vi-VN")}
              <br />
              <span className="text-xs text-muted-foreground">
                {date.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </span>
          );
        },
      },
    ],
    rowActions: [
      {
        label: "Chi tiết",
        icon: <Eye className="h-4 w-4" />,
        onClick: handleViewDetail,
      },
      {
        label: "Hoàn thành",
        icon: <CheckCircle className="h-4 w-4" />,
        onClick: handleComplete,
      },
      {
        label: "Hủy đơn",
        icon: <XCircle className="h-4 w-4" />,
        onClick: handleCancel,
        variant: "destructive",
      },
      {
        label: "Xóa",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: handleDelete,
        variant: "destructive",
        separator: true,
      },
    ],
  };

  return (
    <>
      <DataTable result={result} config={tableConfig} />

      <OrderDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        order={selectedOrder}
      />
    </>
  );
}
