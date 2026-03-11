import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";

export default function DashboardLoading() {
  return (
    <div className="container mx-auto py-6">
      <DashboardSkeleton />
    </div>
  );
}
