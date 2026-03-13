"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTopUpRequest } from "@/lib/hooks/use-top-up-requests";
import { Loader2 } from "lucide-react";

interface TopUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TopUpDialog({ open, onOpenChange }: TopUpDialogProps) {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const createTopUpRequest = useCreateTopUpRequest();

  const formatCurrency = (value: string) => {
    const number = parseInt(value.replace(/\D/g, ""), 10);
    if (isNaN(number)) return "";
    return new Intl.NumberFormat("vi-VN").format(number);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setAmount(rawValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNumber = parseInt(amount, 10);

    if (isNaN(amountNumber) || amountNumber < 1000) {
      return;
    }

    await createTopUpRequest.mutateAsync({
      amount: amountNumber,
      notes: notes.trim() || undefined,
    });

    // Reset form and close dialog
    setAmount("");
    setNotes("");
    onOpenChange(false);
  };

  const isValid = () => {
    const amountNumber = parseInt(amount, 10);
    return !isNaN(amountNumber) && amountNumber >= 1000;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nạp tiền vào ví</DialogTitle>
          <DialogDescription>
            Tạo yêu cầu nạp tiền. Admin sẽ xác nhận sau khi nhận được thanh
            toán.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Số tiền <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="text"
                placeholder="10.000"
                value={formatCurrency(amount)}
                onChange={handleAmountChange}
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₫
              </span>
            </div>
            {amount && parseInt(amount, 10) < 1000 && (
              <p className="text-sm text-red-500">
                Số tiền tối thiểu là 1.000 ₫
              </p>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[10000, 20000, 50000, 100000, 200000, 500000].map((value) => (
              <Button
                key={value}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(String(value))}
                className="text-xs"
              >
                {formatCurrency(String(value))} ₫
              </Button>
            ))}
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="notes"
              placeholder="Thông tin thêm về giao dịch..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Info */}
          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            <p className="font-medium mb-1">Lưu ý:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Yêu cầu sẽ được xử lý trong 24h</li>
              <li>Vui lòng chờ xác nhận từ admin</li>
              <li>Số tiền sẽ được cộng vào ví sau khi được duyệt</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!isValid() || createTopUpRequest.isPending}
              className="flex-1"
            >
              {createTopUpRequest.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi yêu cầu"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
