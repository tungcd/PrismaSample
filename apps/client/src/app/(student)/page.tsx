"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/hooks/use-wallet";
import { useFeaturedProducts } from "@/lib/hooks/use-products";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Wallet, ShoppingBag, Package, TrendingUp } from "lucide-react";
import Image from "next/image";

export default function StudentHomePage() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: featuredProducts, isLoading: productsLoading } =
    useFeaturedProducts();

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="container space-y-4 p-4">
      {/* Welcome Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <span className="text-xl">👋</span>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Xin chào,</p>
          <h1 className="text-lg font-semibold" suppressHydrationWarning>
            {mounted && user?.name ? user.name : "Học sinh"}
          </h1>
        </div>
      </div>

      {/* Wallet Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm opacity-90">Số dư ví</p>
            {walletLoading ? (
              <div className="h-8 w-32 animate-pulse rounded bg-white/20"></div>
            ) : (
              <p className="text-3xl font-bold">
                {formatCurrency(Number(wallet?.balance) || 0)}
              </p>
            )}
          </div>
          <Wallet className="h-8 w-8 opacity-80" />
        </div>
        <Button asChild variant="secondary" size="sm" className="mt-4 w-full">
          <Link href="/wallet">Xem chi tiết</Link>
        </Button>
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
              <Package className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium">Đơn hàng</p>
            <p className="text-xs text-muted-foreground">Theo dõi</p>
          </Card>
        </Link>
      </div>

      {/* Featured Products */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Món ăn nổi bật</h2>
          </div>
          <Link href="/menu" className="text-sm text-primary">
            Xem tất cả →
          </Link>
        </div>

        {productsLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-32 flex-shrink-0">
                <div className="h-32 w-full animate-pulse rounded-lg bg-muted"></div>
                <div className="mt-2 h-4 w-full animate-pulse rounded bg-muted"></div>
                <div className="mt-1 h-3 w-16 animate-pulse rounded bg-muted"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {featuredProducts?.slice(0, 5).map((product) => (
              <Link
                key={product.id}
                href={`/menu/${product.id}`}
                className="w-32 flex-shrink-0"
              >
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  <div className="relative aspect-square w-full bg-muted">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">
                        🍽️
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                        Hết hàng
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 p-2">
                    <p className="line-clamp-1 text-sm font-medium">
                      {product.name}
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      {formatCurrency(Number(product.price))}
                    </p>
                    {product.calories && (
                      <p className="text-xs text-muted-foreground">
                        {product.calories} kcal
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
