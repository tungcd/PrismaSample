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
import { Wallet, ShoppingCart, ShoppingBag, LogOut } from "lucide-react";
import Link from "next/link";
import { useWallet } from "@/lib/hooks/use-wallet";
import { StudentBottomNav } from "@/components/mobile/student-bottom-nav";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { data: wallet, isLoading: walletLoading } = useWallet();

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4 max-w-[450px] w-full px-4 mx-auto">
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
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[450px] bg-white">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="px-4 h-14 flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-primary">
                Smart Canteen
              </h1>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-6 pb-20 space-y-6 bg-gray-50">
          {/* Welcome Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xl">👋</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Xin chào,</p>
              <h1 className="text-lg font-semibold" suppressHydrationWarning>
                {mounted && user?.name ? user.name : "..."}
              </h1>
            </div>
          </div>

          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-primary to-primary/80 p-6 text-white">
            <CardContent className="p-0">
              <div className="flex items-start justify-between mb-2">
                <div className="space-y-1">
                  <p className="text-sm opacity-90">Số dư ví</p>
                  {walletLoading ? (
                    <div className="h-10 w-32 animate-pulse rounded bg-white/20"></div>
                  ) : (
                    <p className="text-3xl font-bold">
                      {formatCurrency(Number(wallet?.balance) || 0)}
                    </p>
                  )}
                </div>
                <Wallet className="h-8 w-8 opacity-80" />
              </div>
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="w-full mt-4"
              >
                <Link href="/wallet">Xem chi tiết</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/menu">
              <Card className="flex flex-col items-center justify-center gap-2 p-6 transition-colors hover:bg-accent">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Đặt món</p>
                <p className="text-xs text-muted-foreground">Xem menu</p>
              </Card>
            </Link>

            <Link href="/orders">
              <Card className="flex flex-col items-center justify-center gap-2 p-6 transition-colors hover:bg-accent">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Đơn hàng</p>
                <p className="text-xs text-muted-foreground">Xem lịch sử</p>
              </Card>
            </Link>
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

        {/* Bottom Navigation */}
        <StudentBottomNav />
      </div>
    </div>
  );
}
