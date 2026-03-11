"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { getUser, logout } from "@/lib/auth-client";

export function DashboardHeader() {
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
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
  );
}
