"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
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
import { updateUserAction } from "../../users/actions";

const profileSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSettingsProps {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
  };
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);

    try {
      const result = await updateUserAction(user.id, {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
      });

      if (result.success) {
        // Refresh page to reload data from database
        router.refresh();
        toast.success("Cập nhật thông tin thành công");
      } else {
        toast.error(result.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
        <CardDescription>
          Cập nhật thông tin tài khoản của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Nguyễn Văn A"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="email@example.com"
            />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              {...form.register("phone")}
              placeholder="0123456789"
            />
          </div>

          <div className="pt-4">
            <div className="text-sm text-gray-600">
              <p>
                <strong>Vai trò:</strong> {user.role}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
