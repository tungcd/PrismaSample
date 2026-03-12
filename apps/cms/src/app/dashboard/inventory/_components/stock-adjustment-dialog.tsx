"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInventoryTransactionAction } from "../actions";
import { InventoryType } from "@/domain/entities/inventory-transaction.entity";
import { Loader2 } from "lucide-react";

interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  productName: string;
  currentStock: number;
}

interface StockFormData {
  type: InventoryType;
  quantity: number;
  reason: string;
}

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  productId,
  productName,
  currentStock,
}: StockAdjustmentDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StockFormData>({
    defaultValues: {
      type: InventoryType.IN,
      quantity: 0,
      reason: "",
    },
  });

  const onSubmit = async (data: StockFormData) => {
    try {
      setIsSubmitting(true);

      // Calculate actual quantity change based on type
      let actualQuantity = Math.abs(data.quantity);
      if (data.type === InventoryType.OUT) {
        actualQuantity = -actualQuantity;
      }

      await createInventoryTransactionAction({
        productId,
        quantity: actualQuantity,
        type: data.type,
        reason: data.reason || undefined,
      });

      toast.success("Cập nhật tồn kho thành công!");
      form.reset();
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error adjusting stock:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật tồn kho");
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchType = form.watch("type");
  const watchQuantity = form.watch("quantity");

  const calculateNewStock = () => {
    const quantity = Math.abs(watchQuantity || 0);
    if (watchType === InventoryType.OUT) {
      return currentStock - quantity;
    }
    return currentStock + quantity;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
          <DialogDescription>
            Nhập/xuất kho cho sản phẩm: <strong>{productName}</strong>
            <br />
            Tồn kho hiện tại: <strong>{currentStock}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              rules={{ required: "Vui lòng chọn loại giao dịch" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại giao dịch</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={InventoryType.IN}>Nhập kho</SelectItem>
                      <SelectItem value={InventoryType.OUT}>
                        Xuất kho
                      </SelectItem>
                      <SelectItem value={InventoryType.ADJUSTMENT}>
                        Điều chỉnh
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              rules={{
                required: "Vui lòng nhập số lượng",
                min: { value: 1, message: "Số lượng phải lớn hơn 0" },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Nhập số lượng"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Tồn kho sau điều chỉnh:{" "}
                    <strong>{calculateNewStock()}</strong>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do (tùy chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập lý do điều chỉnh..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Xác nhận
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
