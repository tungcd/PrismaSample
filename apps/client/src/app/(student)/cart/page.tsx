"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from "@/lib/hooks/use-cart";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { data: cart, isLoading } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const clearCart = useClearCart();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleUpdateQuantity = (
    productId: number,
    currentQuantity: number,
    delta: number,
  ) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    updateCartItem.mutate({ productId, data: { quantity: newQuantity } });
  };

  const handleRemoveItem = (productId: number) => {
    if (confirm("Bạn có chắc muốn xóa món này?")) {
      removeCartItem.mutate(productId);
    }
  };

  const handleClearCart = () => {
    if (confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      clearCart.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="container space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="h-20 w-20 flex-shrink-0 animate-pulse rounded-lg bg-muted"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
              <div className="h-3 w-20 animate-pulse rounded bg-muted"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 p-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold">Giỏ hàng trống</h2>
          <p className="text-sm text-muted-foreground">
            Thêm món ăn vào giỏ hàng để tiếp tục
          </p>
        </div>
        <Button asChild>
          <Link href="/menu">Xem menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header with clear button */}
      <div className="container flex items-center justify-between border-b p-4">
        <h1 className="text-lg font-semibold">
          Giỏ hàng ({cart.itemCount} món)
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearCart}
          disabled={clearCart.isPending}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Xóa tất cả
        </Button>
      </div>

      {/* Cart Items */}
      <div className="container flex-1 space-y-3 p-4">
        {cart.items.map((item) => (
          <Card key={item.productId} className="p-3">
            <div className="flex gap-3">
              {/* Product Image */}
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.product.images && item.product.images.length > 0 ? (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl">
                    🍽️
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-medium line-clamp-1">
                    {item.product.name}
                  </h3>
                  <p className="text-sm font-semibold text-primary">
                    {formatCurrency(item.product.price)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        handleUpdateQuantity(item.productId, item.quantity, -1)
                      }
                      disabled={updateCartItem.isPending}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        handleUpdateQuantity(item.productId, item.quantity, 1)
                      }
                      disabled={updateCartItem.isPending}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-destructive"
                    onClick={() => handleRemoveItem(item.productId)}
                    disabled={removeCartItem.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Sticky Bottom Summary */}
      <div className="sticky bottom-16 border-t bg-background p-4">
        <Card className="mb-3 p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính</span>
              <span>{formatCurrency(Number(cart.total))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Giảm giá</span>
              <span>0đ</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>Tổng cộng</span>
                <span className="text-primary">
                  {formatCurrency(Number(cart.total))}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Button asChild size="lg" className="w-full">
          <Link href="/checkout">
            Thanh toán - {formatCurrency(Number(cart.total))}
          </Link>
        </Button>
      </div>
    </div>
  );
}
