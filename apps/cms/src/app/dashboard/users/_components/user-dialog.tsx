"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserEntity } from "@/domain/entities/user.entity";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserAction, updateUserAction } from "../actions";
import { toast } from "sonner";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/lib/validations/user.schema";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserEntity | null;
  onSuccess: (user: UserEntity) => void;
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserDialogProps) {
  const [loading, setLoading] = useState(false);

  const createForm = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      name: "",
      role: "PARENT",
      phone: "",
      password: "",
    },
  });

  const updateForm = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: "",
      role: "PARENT",
      phone: "",
      password: "",
    },
  });

  const form = user ? updateForm : createForm;

  useEffect(() => {
    if (user) {
      updateForm.reset({
        name: user.name,
        role: user.role,
        phone: user.phone || "",
        password: "",
      });
    } else {
      createForm.reset({
        email: "",
        name: "",
        role: "PARENT",
        phone: "",
        password: "",
      });
    }
  }, [user, open, createForm, updateForm]);

  const onSubmit = async (data: CreateUserInput | UpdateUserInput) => {
    setLoading(true);

    try {
      if (user) {
        const updateData = data as UpdateUserInput;
        const payload: any = {
          name: updateData.name,
          role: updateData.role,
          phone: updateData.phone || undefined,
        };
        if (updateData.password) {
          payload.password = updateData.password;
        }

        const result = await updateUserAction(user.id, payload);
        if (result.success && result.data) {
          toast.success("Cập nhật người dùng thành công");
          onSuccess(result.data);
        } else {
          toast.error(result.error || "Có lỗi xảy ra");
        }
      } else {
        const createData = data as CreateUserInput;
        const result = await createUserAction({
          email: createData.email,
          name: createData.name,
          role: createData.role,
          phone: createData.phone || undefined,
          password: createData.password,
        });

        if (result.success && result.data) {
          toast.success("Tạo người dùng thành công");
          onSuccess(result.data);
        } else {
          toast.error(result.error || "Có lỗi xảy ra");
        }
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {user ? "Sửa người dùng" : "Thêm người dùng"}
            </DialogTitle>
            <DialogDescription>
              {user
                ? "Cập nhật thông tin người dùng"
                : "Tạo người dùng mới trong hệ thống"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {!user && (
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...createForm.register("email")}
                  placeholder="email@example.com"
                />
                {createForm.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {createForm.formState.errors.email.message}
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Tên *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Nguyễn Văn A"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Vai trò *</Label>
              <Select
                value={form.watch("role")}
                onValueChange={(value) => form.setValue("role", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MANAGER">Quản lý</SelectItem>
                  <SelectItem value="STAFF">Nhân viên</SelectItem>
                  <SelectItem value="PARENT">Phụ huynh</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.role.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="0123456789"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">
                Mật khẩu {user ? "(để trống nếu không đổi)" : "*"}
              </Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                placeholder="••••••••"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
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
              {loading ? "Đang xử lý..." : user ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
