import { TableSkeleton } from "@/components/skeletons/table-skeleton";

export default function OrdersLoading() {
  return (
    <div className="container mx-auto py-6">
      <TableSkeleton columns={8} rows={10} showActions={true} />
    </div>
  );
}
