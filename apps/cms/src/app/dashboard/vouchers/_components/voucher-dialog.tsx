"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { ControllerRenderProps } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { VoucherEntity, DiscountType } from "@/domain/entities/voucher.entity";
import { createVoucherAction, updateVoucherAction } from "../actions";
import { toast } from "sonner";

const voucherSchema = z.object({
  code: z.string().min(3, "Mã voucher phải có ít nhất 3 ký tự").toUpperCase(),
  description: z.string().optional(),
  discount: z.coerce.number().positive("Giảm giá phải > 0"),
  discountType: z.nativeEnum(DiscountType),
  minAmount: z.coerce.number().min(0).optional().or(z.literal("")),
  maxDiscount: z.coerce.number().min(0).optional().or(z.literal("")),
  usageLimit: z.coerce.number().int().min(1).optional().or(z.literal("")),
  startsAt: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  expiresAt: z.string().min(1, "Vui lòng chọn ngày hết hạn"),
  isActive: z.boolean().default(true),
});

type VoucherFormData = z.infer<typeof voucherSchema>;

interface VoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher?: VoucherEntity;
  onSuccess?: () => void;
}

export function VoucherDialog({
  open,
  onOpenChange,
  voucher,
  onSuccess,
}: VoucherDialogProps) {
  const form = useForm<VoucherFormData>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      code: "",
      description: "",
      discount: 0,
      discountType: DiscountType.PERCENTAGE,
      minAmount: "",
      maxDiscount: "",
      usageLimit: "",
      startsAt: "",
      expiresAt: "",
      isActive: true,
    },
  });

  // Reset form when voucher changes or dialog opens
  useEffect(() => {
    if (voucher) {
      form.reset({
        code: voucher.code,
        description: voucher.description || "",
        discount: voucher.discount,
        discountType: voucher.discountType,
        minAmount: voucher.minAmount?.toString() || "",
        maxDiscount: voucher.maxDiscount?.toString() || "",
        usageLimit: voucher.usageLimit?.toString() || "",
        startsAt: new Date(voucher.startsAt).toISOString().slice(0, 16),
        expiresAt: new Date(voucher.expiresAt).toISOString().slice(0, 16),
        isActive: voucher.isActive,
      });
    } else {
      form.reset({
        code: "",
        description: "",
        discount: 0,
        discountType: DiscountType.PERCENTAGE,
        minAmount: "",
        maxDiscount: "",
        usageLimit: "",
        startsAt: "",
        expiresAt: "",
        isActive: true,
      });
    }
  }, [voucher, open, form]);

  const onSubmit = async (data: VoucherFormData) => {
    try {
      const payload = {
        code: data.code,
        description: data.description || undefined,
        discount: data.discount,
        discountType: data.discountType,
        minAmount: data.minAmount ? Number(data.minAmount) : undefined,
        maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : undefined,
        usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
        startsAt: new Date(data.startsAt),
        expiresAt: new Date(data.expiresAt),
        isActive: data.isActive,
      };

      if (voucher) {
        const result = await updateVoucherAction(voucher.id, payload);

        if (result.success) {
          toast.success("Cập nhật voucher thành công");
          form.reset();
          onSuccess?.();
        } else {
          toast.error(result.error || "Có lỗi xảy ra");
        }
      } else {
        const result = await createVoucherAction(payload);

        if (result.success) {
          toast.success("Thêm voucher thành công");
          form.reset();
          onSuccess?.();
        } else {
          toast.error(result.error || "Có lỗi xảy ra");
        }
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {voucher ? "Chỉnh sửa voucher" : "Thêm voucher mới"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({
                field,
              }: {
                field: ControllerRenderProps<VoucherFormData, "code">;
              }) => (
                <FormItem>
                  <FormLabel>Mã voucher *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="SUMMER2024"
                      className="uppercase"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({
                field,
              }: {
                field: ControllerRenderProps<VoucherFormData, "description">;
              }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Giảm giá mùa hè"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discountType"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<VoucherFormData, "discountType">;
                }) => (
                  <FormItem>
                    <FormLabel>Loại giảm giá *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={DiscountType.PERCENTAGE}>
                          Phần trăm (%)
                        </SelectItem>
                        <SelectItem value={DiscountType.FIXED}>
                          Cố định (₫)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<VoucherFormData, "discount">;
                }) => (
                  <FormItem>
                    <FormLabel>Giá trị giảm *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minAmount"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<VoucherFormData, "minAmount">;
                }) => (
                  <FormItem>
                    <FormLabel>Đơn hàng tối thiểu</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" placeholder="0" />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Để trống = không giới hạn
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxDiscount"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<VoucherFormData, "maxDiscount">;
                }) => (
                  <FormItem>
                    <FormLabel>Giảm tối đa</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" placeholder="0" />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Chỉ cho voucher %
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="usageLimit"
              render={({
                field,
              }: {
                field: ControllerRenderProps<VoucherFormData, "usageLimit">;
              }) => (
                <FormItem>
                  <FormLabel>Giới hạn sử dụng</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="1" placeholder="100" />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Để trống = không giới hạn
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startsAt"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<VoucherFormData, "startsAt">;
                }) => (
                  <FormItem>
                    <FormLabel>Ngày bắt đầu *</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<VoucherFormData, "expiresAt">;
                }) => (
                  <FormItem>
                    <FormLabel>Ngày hết hạn *</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({
                field,
              }: {
                field: ControllerRenderProps<VoucherFormData, "isActive">;
              }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Kích hoạt</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit">{voucher ? "Cập nhật" : "Thêm mới"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
