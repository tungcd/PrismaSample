import { Skeleton } from "@/components/ui/skeleton";

export default function WalletsLoading() {
  return (
    <div className="p-6">
      <Skeleton className="mb-6 h-8 w-64" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}
