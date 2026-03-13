"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogOut, Phone, Mail, Shield } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      document.cookie = "token=; path=/; max-age=0";
      router.push("/login");
    }
  };

  // Prevent hydration mismatch by waiting for client-side mount
  if (!mounted || !user) {
    return (
      <div className="container max-w-2xl py-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-4 pb-20 space-y-4">
      <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl" suppressHydrationWarning>
                {user.name}
              </CardTitle>
              <p
                className="text-sm text-muted-foreground capitalize"
                suppressHydrationWarning
              >
                {user.role === "STUDENT"
                  ? "Học sinh"
                  : user.role === "PARENT"
                    ? "Phụ huynh"
                    : user.role}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email */}
          {user.email && (
            <div className="flex items-center gap-3 pb-3 border-b">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium" suppressHydrationWarning>
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Phone */}
          {user.phone && (
            <div className="flex items-center gap-3 pb-3 border-b">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Số điện thoại</p>
                <p className="font-medium" suppressHydrationWarning>
                  {user.phone}
                </p>
              </div>
            </div>
          )}

          {/* Role */}
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Vai trò</p>
              <p className="font-medium capitalize" suppressHydrationWarning>
                {user.role === "STUDENT"
                  ? "Học sinh"
                  : user.role === "PARENT"
                    ? "Phụ huynh"
                    : user.role === "ADMIN"
                      ? "Quản trị viên"
                      : user.role === "MANAGER"
                        ? "Quản lý"
                        : user.role === "STAFF"
                          ? "Nhân viên"
                          : user.role}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cài đặt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/profile/edit">
              <User className="h-4 w-4 mr-2" />
              Chỉnh sửa thông tin
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/profile/change-password">
              <Shield className="h-4 w-4 mr-2" />
              Đổi mật khẩu
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Button variant="destructive" className="w-full" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" />
        Đăng xuất
      </Button>
    </div>
  );
}
