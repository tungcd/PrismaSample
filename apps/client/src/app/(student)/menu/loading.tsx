import { ProductCardSkeleton } from "@/components/skeletons/mobile-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function MenuLoading() {
  return (
    <div className="container space-y-4 p-4">
      {/* Search Bar Skeleton */}
      <Skeleton className="h-10 w-full" />

      {/* Category Chips Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 w-20 flex-shrink-0" />
        ))}
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
