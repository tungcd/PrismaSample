"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { changePasswordAction } from "../actions";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function SecuritySettings() {
  const [loading, setLoading] = useState(false);

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    setLoading(true);

    try {
      const result = await changePasswordAction({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (result.success) {
        toast.success("Đổi mật khẩu thành công");
        form.reset();
      } else {
        toast.error(result.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Có lỗi xảy ra khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đổi mật khẩu</CardTitle>
        <CardDescription>
          Cập nhật mật khẩu để bảo mật tài khoản của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">
              Mật khẩu hiện tại <span className="text-red-500">*</span>
            </Label>
            <Input
              id="currentPassword"
              type="password"
              {...form.register("currentPassword")}
              placeholder="Nhập mật khẩu hiện tại"
            />
            {form.formState.errors.currentPassword && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="newPassword">
              Mật khẩu mới <span className="text-red-500">*</span>
            </Label>
            <Input
              id="newPassword"
              type="password"
              {...form.register("newPassword")}
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            />
            {form.formState.errors.newPassword && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              {...form.register("confirmPassword")}
              placeholder="Nhập lại mật khẩu mới"
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
