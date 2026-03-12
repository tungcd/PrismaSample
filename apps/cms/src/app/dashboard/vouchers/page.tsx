import { VouchersTable } from "./_components/vouchers-table";
import { getAllVouchersAction } from "./actions";

// ISR: Cache for 120 seconds (vouchers change moderately)
export const revalidate = 120;

interface VouchersPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    code?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default async function VouchersPage({
  searchParams,
}: VouchersPageProps) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = parseInt(searchParams.pageSize || "10");
  const code = searchParams.code;
  const status = searchParams.status as
    | "active"
    | "inactive"
    | "all"
    | undefined;
  const sortBy = searchParams.sortBy as
    | "code"
    | "discount"
    | "startsAt"
    | "expiresAt"
    | "createdAt";
  const sortOrder = searchParams.sortOrder as "asc" | "desc";

  const vouchersResult = await getAllVouchersAction({
    page,
    pageSize,
    code,
    status,
    sortBy,
    sortOrder,
  });

  if (!vouchersResult.success) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-2xl font-bold">Vouchers</h1>
        <div className="text-red-500">
          Error: {vouchersResult.error || "Failed to load vouchers"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Vouchers</h1>
      <VouchersTable
        data={vouchersResult.data!.vouchers}
        total={vouchersResult.data!.total}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}
