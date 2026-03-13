"use client";

import { ProductCard } from "./product-card";
import { ProductCardSkeleton } from "@/components/skeletons/mobile-skeletons";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  images: string[];
  calories?: number | null;
}

interface ProductsGridProps {
  products: Product[];
  isLoading: boolean;
  onAddToCart: (
    productId: number,
    productName: string,
    price: number,
    stock: number,
  ) => void;
  isAddingToCart?: boolean;
}

export function ProductsGrid({
  products,
  isLoading,
  onAddToCart,
  isAddingToCart,
}: ProductsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-center">
        <p className="text-4xl">🍽️</p>
        <p className="text-sm text-muted-foreground">Không tìm thấy món ăn</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          isAddingToCart={isAddingToCart}
        />
      ))}
    </div>
  );
}
