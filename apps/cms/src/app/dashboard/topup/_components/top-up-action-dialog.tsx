"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TopUpEntity } from "@/domain/entities/top-up.entity";
import { approveTopUpAction, rejectTopUpAction } from "../actions";
import { toast } from "sonner";

interface TopUpActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topUp: TopUpEntity | null;
  actionType: "approve" | "reject" | null;
}

export function TopUpActionDialog({
  open,
  onOpenChange,
  topUp,
  actionType,
}: TopUpActionDialogProps) {
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!topUp || !actionType) return;

    if (actionType === "reject" && !adminNotes.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    setLoading(true);

    try {
      let result;
      if (actionType === "approve") {
        result = await approveTopUpAction(topUp.id, adminNotes || undefined);
      } else {
        result = await rejectTopUpAction(topUp.id, adminNotes);
      }

      if (result.success) {
        toast.success(
          actionType === "approve"
            ? "Đã phê duyệt yêu cầu nạp tiền"
            : "Đã từ chối yêu cầu nạp tiền",
        );
        setAdminNotes("");
        onOpenChange(false);
      } else {
        toast.error(result.error || "Xử lý yêu cầu thất bại");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (!topUp || !actionType) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {actionType === "approve" ? "Phê duyệt" : "Từ chối"} yêu cầu nạp
            tiền
          </DialogTitle>
          <DialogDescription>
            Xác nhận {actionType === "approve" ? "phê duyệt" : "từ chối"} yêu
            cầu nạp tiền #{topUp.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Top-up Info */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Phụ huynh:</span>
              <span className="font-medium">{topUp.user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Số tiền:</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(topUp.amount)}
              </span>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="adminNotes">
              Ghi chú {actionType === "reject" ? "(bắt buộc)" : "(tùy chọn)"}
            </Label>
            <Textarea
              id="adminNotes"
              placeholder={
                actionType === "approve"
                  ? "Nhập ghi chú (nếu có)..."
                  : "Nhập lý do từ chối..."
              }
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            variant={actionType === "approve" ? "default" : "destructive"}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Đang xử lý..."
              : actionType === "approve"
                ? "Phê duyệt"
                : "Từ chối"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
