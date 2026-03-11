import { TableSkeleton } from "@/components/skeletons/table-skeleton";

export default function ProductsLoading() {
  return (
    <div className="container mx-auto py-6">
      <TableSkeleton columns={6} rows={10} showActions={true} />
    </div>
  );
}
