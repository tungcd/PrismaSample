"use client";

import { Button } from "@/components/ui/button";

interface CategoryFiltersProps {
  categories: Array<{ id: number; name: string }>;
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  isLoading?: boolean;
}

export function CategoryFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  isLoading,
}: CategoryFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        className="flex-shrink-0"
        onClick={() => onSelectCategory(null)}
      >
        Tất cả
      </Button>
      {isLoading ? (
        <>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 w-20 flex-shrink-0 animate-pulse rounded-md bg-muted"
            />
          ))}
        </>
      ) : (
        categories?.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            className="flex-shrink-0"
            onClick={() =>
              onSelectCategory(
                selectedCategory === category.id ? null : category.id,
              )
            }
          >
            {category.name}
          </Button>
        ))
      )}
    </div>
  );
}
