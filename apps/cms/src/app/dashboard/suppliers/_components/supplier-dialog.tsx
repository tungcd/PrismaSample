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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SupplierEntity } from "@/domain/entities/supplier.entity";
import { createSupplierAction, updateSupplierAction } from "../actions";
import { toast } from "sonner";

const supplierSchema = z.object({
  name: z.string().min(2, "Tên nhà cung cấp phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().default(true),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: SupplierEntity;
  onSuccess?: () => void;
}

export function SupplierDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess,
}: SupplierDialogProps) {
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      isActive: true,
    },
  });

  // Reset form when supplier changes or dialog opens
  useEffect(() => {
    if (supplier) {
      form.reset({
        name: supplier.name,
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        isActive: supplier.isActive,
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        address: "",
        isActive: true,
      });
    }
  }, [supplier, open, form]);

  const onSubmit = async (data: SupplierFormData) => {
    try {
      if (supplier) {
        const result = await updateSupplierAction(supplier.id, {
          name: data.name,
          email: data.email || undefined,
          phone: data.phone || undefined,
          address: data.address || undefined,
          isActive: data.isActive,
        });

        if (result.success) {
          toast.success("Cập nhật nhà cung cấp thành công");
          form.reset();
          onSuccess?.();
        } else {
          toast.error(result.error || "Có lỗi xảy ra");
        }
      } else {
        const result = await createSupplierAction({
          name: data.name,
          email: data.email || undefined,
          phone: data.phone || undefined,
          address: data.address || undefined,
          isActive: data.isActive,
        });

        if (result.success) {
          toast.success("Thêm nhà cung cấp thành công");
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {supplier ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp mới"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({
                field,
              }: {
                field: ControllerRenderProps<SupplierFormData, "name">;
              }) => (
                <FormItem>
                  <FormLabel>Tên nhà cung cấp *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ví dụ: Công ty TNHH ABC" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({
                field,
              }: {
                field: ControllerRenderProps<SupplierFormData, "email">;
              }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="supplier@example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({
                field,
              }: {
                field: ControllerRenderProps<SupplierFormData, "phone">;
              }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0123456789" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({
                field,
              }: {
                field: ControllerRenderProps<SupplierFormData, "address">;
              }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Địa chỉ nhà cung cấp"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({
                field,
              }: {
                field: ControllerRenderProps<SupplierFormData, "isActive">;
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
              <Button type="submit">
                {supplier ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
