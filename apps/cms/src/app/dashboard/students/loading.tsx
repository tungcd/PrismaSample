import { TableSkeleton } from "@/components/skeletons/table-skeleton";

export default function StudentsLoading() {
  return (
    <div className="container mx-auto py-6">
      <TableSkeleton columns={7} rows={10} showActions={true} />
    </div>
  );
}
