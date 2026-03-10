"use client";

import { useEffect, useState } from "react";
import { getUser, logout } from "@/lib/auth-client";
import { fetchAPI } from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShoppingCart, Package, LogOut } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalStudents: number;
  totalOrders: number;
  totalProducts: number;
}

export default function DashboardPage() {
  const user = getUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // You'll need to create these endpoints in your API
      // For now, we'll use placeholder data
      setStats({
        totalUsers: 0,
        totalStudents: 0,
        totalOrders: 0,
        totalProducts: 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      title: "Tổng người dùng",
      value: stats?.totalUsers || 0,
      icon: Users,
      description: "Người dùng đang hoạt động",
    },
    {
      title: "Học sinh",
      value: stats?.totalStudents || 0,
      icon: Users,
      description: "Học sinh đang theo học",
    },
    {
      title: "Đơn hàng",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      description: "Tổng đơn hàng",
    },
    {
      title: "Sản phẩm",
      value: stats?.totalProducts || 0,
      icon: Package,
      description: "Sản phẩm đang bán",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Xin chào, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Chào mừng bạn đến với hệ thống quản lý Smart Canteen
          </p>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Tổng quan các hoạt động mới nhất trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Chức năng này đang được phát triển...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông báo</CardTitle>
            <CardDescription>
              Các thông báo quan trọng cần xử lý
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Không có thông báo mới
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
