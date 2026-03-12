"use client";

import { TopUpEntity } from "@/domain/entities/top-up.entity";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { formatDateTime } from "@/lib/utils/date";

interface TopUpDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topUp: TopUpEntity | null;
}

export function TopUpDetailDialog({
  open,
  onOpenChange,
  topUp,
}: TopUpDetailDialogProps) {
  if (!topUp) return null;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      PENDING: "secondary",
      APPROVED: "default",
      REJECTED: "destructive",
    };

    const labels: Record<string, string> = {
      PENDING: "Chờ duyệt",
      APPROVED: "Đã duyệt",
      REJECTED: "Đã từ chối",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết yêu cầu nạp tiền #{topUp.id}</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về yêu cầu nạp tiền
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div>
            <h3 className="font-semibold mb-2">Trạng thái</h3>
            {getStatusBadge(topUp.status)}
          </div>

          <Separator />

          {/* User Info */}
          <div>
            <h3 className="font-semibold mb-2">Thông tin phụ huynh</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Họ tên:</span>
                <span className="font-medium">{topUp.user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{topUp.user?.email}</span>
              </div>
              {topUp.user?.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số điện thoại:</span>
                  <span>{topUp.user.phone}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Amount */}
          <div>
            <h3 className="font-semibold mb-2">Số tiền nạp</h3>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(topUp.amount)}
            </div>
          </div>

          <Separator />

          {/* Proof Image */}
          {topUp.proofImage && (
            <>
              <div>
                <h3 className="font-semibold mb-2">Ảnh chứng từ</h3>
                <div className="relative w-full h-64 border rounded-lg overflow-hidden">
                  <Image
                    src={topUp.proofImage}
                    alt="Proof of transfer"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Notes */}
          {topUp.notes && (
            <>
              <div>
                <h3 className="font-semibold mb-2">Ghi chú của phụ huynh</h3>
                <p className="text-sm text-muted-foreground">{topUp.notes}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Admin Notes */}
          {topUp.adminNotes && (
            <>
              <div>
                <h3 className="font-semibold mb-2">Ghi chú của admin</h3>
                <p className="text-sm text-muted-foreground">
                  {topUp.adminNotes}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* Approver Info */}
          {topUp.approver && (
            <>
              <div>
                <h3 className="font-semibold mb-2">Người xử lý</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Họ tên:</span>
                    <span className="font-medium">{topUp.approver.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{topUp.approver.email}</span>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Timestamps */}
          <div>
            <h3 className="font-semibold mb-2">Thời gian</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày tạo:</span>
                <span suppressHydrationWarning>{formatDateTime(topUp.createdAt)}</span>
              </div>
              {topUp.processedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày xử lý:</span>
                  <span suppressHydrationWarning>{formatDateTime(topUp.processedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
