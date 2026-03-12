"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InfiniteSelectBox } from "@/components/ui/infinite-select-box";
import {
  getParentsForSelect,
  getParentById,
  type ParentSelectEntity,
} from "@/app/actions/get-parents.action";
import { createTopUpAction } from "../actions";
import { toast } from "sonner";

const topUpSchema = z.object({
  userId: z.number().positive("Vui lòng chọn phụ huynh"),
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  proofImage: z.string().optional(),
  notes: z.string().optional(),
});

type TopUpInput = z.infer<typeof topUpSchema>;

interface TopUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TopUpDialog({
  open,
  onOpenChange,
  onSuccess,
}: TopUpDialogProps) {
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  const form = useForm<TopUpInput>({
    resolver: zodResolver(topUpSchema),
    defaultValues: {
      userId: 0,
      amount: 0,
      proofImage: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      setUploadError("");
    }
  }, [open, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Kích thước ảnh không được vượt quá 2MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      form.setValue("proofImage", base64String);
      setUploadError("");
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: TopUpInput) => {
    setLoading(true);

    try {
      const result = await createTopUpAction({
        userId: data.userId,
        amount: data.amount,
        proofImage: data.proofImage || undefined,
        notes: data.notes || undefined,
      });

      if (result.success) {
        toast.success("Tạo yêu cầu nạp tiền thành công");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Tạo yêu cầu nạp tiền thất bại");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo yêu cầu nạp tiền");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo yêu cầu nạp tiền</DialogTitle>
          <DialogDescription>
            Tạo yêu cầu nạp tiền mới cho phụ huynh
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Parent Selection */}
          <div className="space-y-2">
            <Label htmlFor="userId">
              Phụ huynh <span className="text-red-500">*</span>
            </Label>
            <InfiniteSelectBox<ParentSelectEntity>
              fetchFn={getParentsForSelect}
              fetchByIdFn={getParentById}
              value={form.watch("userId")}
              onChange={(value) => form.setValue("userId", Number(value) || 0)}
              placeholder="Chọn phụ huynh"
              searchPlaceholder="Tìm theo tên, email, số điện thoại..."
              renderOption={(parent) => (
                <div className="flex flex-col">
                  <span className="font-medium">{parent.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {parent.email}
                  </span>
                </div>
              )}
              error={form.formState.errors.userId?.message}
              disabled={loading}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Số tiền (VNĐ) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Nhập số tiền"
              {...form.register("amount", { valueAsNumber: true })}
              disabled={loading}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-red-500">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          {/* Proof Image */}
          <div className="space-y-2">
            <Label htmlFor="proofImage">Ảnh chứng từ (tùy chọn)</Label>
            <Input
              id="proofImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
            />
            {uploadError && (
              <p className="text-sm text-red-500">{uploadError}</p>
            )}
            {form.watch("proofImage") && (
              <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                <img
                  src={form.watch("proofImage")}
                  alt="Proof preview"
                  className="w-full h-full object-contain"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => form.setValue("proofImage", "")}
                >
                  Xóa
                </Button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="notes"
              placeholder="Nhập ghi chú..."
              {...form.register("notes")}
              disabled={loading}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo yêu cầu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
