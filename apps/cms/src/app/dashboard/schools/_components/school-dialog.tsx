"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SchoolEntity } from "@/domain/entities/school.entity";
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
import { Checkbox } from "@/components/ui/checkbox";
import { createSchoolAction, updateSchoolAction } from "../actions";
import { toast } from "sonner";

const schoolSchema = z.object({
  name: z.string().min(3, "Tên trường phải có ít nhất 3 ký tự"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

interface SchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: SchoolEntity | null;
  onSuccess: () => void;
}

export function SchoolDialog({
  open,
  onOpenChange,
  school,
  onSuccess,
}: SchoolDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (school) {
      form.reset({
        name: school.name,
        address: school.address || "",
        phone: school.phone || "",
        email: school.email || "",
        isActive: school.isActive,
      });
    } else {
      form.reset({
        name: "",
        address: "",
        phone: "",
        email: "",
        isActive: true,
      });
    }
  }, [school, open, form]);

  const onSubmit = async (data: SchoolFormData) => {
    setLoading(true);

    try {
      const payload = {
        name: data.name,
        address: data.address || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        isActive: data.isActive,
      };

      if (school) {
        const result = await updateSchoolAction(school.id, payload);
        if (result.success && result.data) {
          toast.success("Cập nhật trường học thành công");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(result.error || "Có lỗi xảy ra");
        }
      } else {
        const result = await createSchoolAction(payload);
        if (result.success && result.data) {
          toast.success("Tạo trường học thành công");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(result.error || "Có lỗi xảy ra");
        }
      }
    } catch (error) {
      console.error("Error submitting school:", error);
      toast.error("Có lỗi xảy ra khi lưu trường học");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {school ? "Cập nhật trường học" : "Tạo trường học mới"}
          </DialogTitle>
          <DialogDescription>
            {school
              ? "Chỉnh sửa thông tin trường học"
              : "Nhập thông tin trường học mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">
              Tên trường <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="VD: THCS Nguyễn Du"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="address">Địa chỉ</Label>
            <Textarea
              id="address"
              {...form.register("address")}
              placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="phone">Điện thoại</Label>
            <Input
              id="phone"
              {...form.register("phone")}
              placeholder="VD: 028 1234 5678"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="VD: contact@school.edu.vn"
            />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={form.watch("isActive")}
              onCheckedChange={(checked) =>
                form.setValue("isActive", checked as boolean)
              }
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Hoạt động
            </Label>
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
              {loading ? "Đang lưu..." : school ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
