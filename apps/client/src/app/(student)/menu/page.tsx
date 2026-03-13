"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useProducts, useCategories } from "@/lib/hooks/use-products";
import { useAddToCart } from "@/lib/hooks/use-cart";
import { Search } from "lucide-react";
import { ProductFilters } from "@/lib/api/products.api";
import { CategoryFilters } from "./_components/category-filters";
import { ProductsGrid } from "./_components/products-grid";

export default function MenuPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const filters: ProductFilters = {
    search,
    categoryId: selectedCategory || undefined,
    page: 1,
    limit: 20,
  };

  const { data: productsData, isLoading: productsLoading } =
    useProducts(filters);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const addToCart = useAddToCart();

  const products = productsData?.data || [];

  const handleAddToCart = (
    productId: number,
    productName: string,
    price: number,
    stock: number,
  ) => {
    if (stock === 0) {
      return;
    }

    addToCart.mutate({ productId, quantity: 1 });
  };

  return (
    <div className="container space-y-4 p-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm món ăn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Filters */}
      <CategoryFilters
        categories={categories || []}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        isLoading={categoriesLoading}
      />

      {/* Products Grid */}
      <ProductsGrid
        products={products}
        isLoading={productsLoading}
        onAddToCart={handleAddToCart}
        isAddingToCart={addToCart.isPending}
      />
    </div>
  );
}
