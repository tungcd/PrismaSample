"use client";

import { Home, Menu, ShoppingCart, Package, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/stores/cart.store";

const studentTabs = [
  {
    name: "Trang chủ",
    href: "/",
    icon: Home,
  },
  {
    name: "Menu",
    href: "/menu",
    icon: Menu,
  },
  {
    name: "Giỏ hàng",
    href: "/cart",
    icon: ShoppingCart,
    showBadge: true,
  },
  {
    name: "Đơn hàng",
    href: "/orders",
    icon: Package,
  },
  {
    name: "Tôi",
    href: "/profile",
    icon: User,
  },
];

export function StudentBottomNav() {
  const pathname = usePathname();
  const cartItemCount = useCartStore((state) => state.getItemCount());

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] z-50 border-t bg-background">
      <div className="grid h-16 grid-cols-5">
        {studentTabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {tab.showBadge && cartItemCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
              </div>
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
