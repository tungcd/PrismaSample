"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    stock: number;
    images: string[];
    calories?: number | null;
  };
  onAddToCart: (
    productId: number,
    productName: string,
    price: number,
    stock: number,
  ) => void;
  isAddingToCart?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  isAddingToCart,
}: ProductCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
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
          <div className="flex h-full items-center justify-center text-5xl">
            🍽️
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white">
            Hết hàng
          </div>
        )}
      </div>

      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2 text-sm font-medium">{product.name}</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              {formatCurrency(Number(product.price))}
            </p>
            {product.calories && (
              <p className="text-xs text-muted-foreground">
                {product.calories} kcal
              </p>
            )}
          </div>

          <Button
            size="sm"
            className="h-8 w-8 rounded-full p-0"
            onClick={() =>
              onAddToCart(
                product.id,
                product.name,
                Number(product.price),
                product.stock,
              )
            }
            disabled={product.stock === 0 || isAddingToCart}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
