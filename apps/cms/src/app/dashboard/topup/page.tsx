import { getTopUpsUseCase } from "@/application/use-cases/top-up/get-top-ups.use-case";
import { TopUpsTable } from "./_components/top-ups-table";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    status?: "PENDING" | "APPROVED" | "REJECTED";
    userId?: string;
    approvedBy?: string;
    user?: string; // From DataTable filter
    approver?: string; // From DataTable filter
  }>;
}

export default async function TopUpsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const status = params.status;
  const userId = params.userId ? Number(params.userId) : undefined;
  const approvedBy = params.approvedBy ? Number(params.approvedBy) : undefined;

  // Also check for filter params from DataTable (uses column keys)
  const userFilter = params.user ? Number(params.user) : userId;
  const approverFilter = params.approver ? Number(params.approver) : approvedBy;

  const result = await getTopUpsUseCase({
    page,
    pageSize,
    status,
    userId: userFilter,
    approvedBy: approverFilter,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Quản lý nạp tiền</h1>
        <p className="text-muted-foreground">
          Quản lý các yêu cầu nạp tiền vào ví
        </p>
      </div>

      <TopUpsTable result={result} />
    </div>
  );
}
