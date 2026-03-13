"use client";

import { useEffect, useState } from "react";
import { logout } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ShoppingCart, LogOut } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        setUser(null);
      }
    }
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="animate-pulse space-y-4 max-w-md w-full px-4">
          <div className="h-16 bg-white rounded-lg"></div>
          <div className="h-32 bg-white rounded-lg"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-40 bg-white rounded-lg"></div>
            <div className="h-40 bg-white rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">Smart Canteen</h1>
            <p
              className="text-sm text-muted-foreground"
              suppressHydrationWarning
            >
              Xin chào, {mounted && user?.name ? user.name : "..."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <CardHeader>
            <CardDescription className="text-blue-100">
              Tổng số dư
            </CardDescription>
            <CardTitle className="text-4xl font-bold">0 ₫</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/topup">
                <Wallet className="mr-2 h-4 w-4" />
                Nạp tiền
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <Link href="/menu">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-lg">Đặt món</CardTitle>
                <CardDescription>Xem thực đơn và đặt món ăn</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <Link href="/orders">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-lg">Đơn hàng</CardTitle>
                <CardDescription>Xem lịch sử đơn hàng</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách học sinh</CardTitle>
            <CardDescription>Thông tin các con</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">
              Chức năng này đang được phát triển...
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
