"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUser, logout } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Wallet,
  UserCog,
  Settings,
  LogOut,
  Building2,
  Menu,
  FolderKanban,
  Truck,
  Receipt,
  CreditCard,
  Ticket,
  Warehouse,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { User } from "@/lib/auth-client";
import { Role } from "@smart-canteen/prisma";
type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
};
const navigation: NavigationItem[] = [
  {
    name: "Tổng quan",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [Role.ADMIN, Role.MANAGER, Role.STAFF],
  },
  {
    name: "Người dùng",
    href: "/dashboard/users",
    icon: Users,
    roles: [Role.ADMIN, Role.MANAGER],
  },
  {
    name: "Học sinh",
    href: "/dashboard/students",
    icon: UserCog,
    roles: [Role.ADMIN, Role.MANAGER, Role.STAFF],
  },
  {
    name: "Đơn hàng",
    href: "/dashboard/orders",
    icon: ShoppingCart,
    roles: [Role.ADMIN, Role.MANAGER, Role.STAFF],
  },
  {
    name: "Sản phẩm",
    href: "/dashboard/products",
    icon: Package,
    roles: [Role.ADMIN, Role.MANAGER, Role.STAFF],
  },
  {
    name: "Nạp tiền",
    href: "/dashboard/topup",
    icon: Wallet,
    roles: [Role.ADMIN, Role.MANAGER],
  },
  {
    name: "Trường học",
    href: "/dashboard/schools",
    icon: Building2,
    roles: [Role.ADMIN],
  },
  {
    name: "Danh mục",
    href: "/dashboard/categories",
    icon: FolderKanban,
    roles: [Role.ADMIN],
  },
  {
    name: "Nhà cung cấp",
    href: "/dashboard/suppliers",
    icon: Truck,
    roles: [Role.ADMIN],
  },
  {
    name: "Giao dịch",
    href: "/dashboard/transactions",
    icon: Receipt,
    roles: [Role.ADMIN, Role.MANAGER],
  },
  {
    name: "Quản lý ví",
    href: "/dashboard/wallets",
    icon: CreditCard,
    roles: [Role.ADMIN, Role.MANAGER],
  },
  {
    name: "Vouchers",
    href: "/dashboard/vouchers",
    icon: Ticket,
    roles: [Role.ADMIN, Role.MANAGER],
  },
  {
    name: "Quản lý kho",
    href: "/dashboard/inventory",
    icon: Warehouse,
    roles: [Role.ADMIN, Role.MANAGER],
  },
  {
    name: "Báo cáo",
    href: "/dashboard/reports",
    icon: BarChart3,
    roles: [Role.ADMIN, Role.MANAGER],
  },
  {
    name: "Cài đặt",
    href: "/dashboard/settings",
    icon: Settings,
    roles: [Role.ADMIN, Role.MANAGER],
  },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const userRole = user?.role as Role;

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-card border-r transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-xl font-bold text-primary">Smart Canteen</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User info & logout */}
          <div className="border-t p-4">
            <div className="mb-3 flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">Smart Canteen</h1>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
