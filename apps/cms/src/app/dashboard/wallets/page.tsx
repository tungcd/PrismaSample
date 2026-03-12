import { getAllWalletsAction } from "./actions";
import { WalletsTable } from "./_components/wallets-table";

// ISR: Cache for 30 seconds (wallet balances need frequent updates)
export const revalidate = 30;

interface WalletsPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    userId?: string;
    isLocked?: string;
    minBalance?: string;
    maxBalance?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default async function WalletsPage({ searchParams }: WalletsPageProps) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = parseInt(searchParams.pageSize || "10");
  const userId = searchParams.userId
    ? parseInt(searchParams.userId)
    : undefined;
  const isLocked =
    searchParams.isLocked === "true"
      ? true
      : searchParams.isLocked === "false"
        ? false
        : undefined;
  const minBalance = searchParams.minBalance
    ? parseFloat(searchParams.minBalance)
    : undefined;
  const maxBalance = searchParams.maxBalance
    ? parseFloat(searchParams.maxBalance)
    : undefined;
  const sortBy = searchParams.sortBy as "balance" | "createdAt" | "updatedAt";
  const sortOrder = searchParams.sortOrder as "asc" | "desc";

  const walletsResult = await getAllWalletsAction({
    page,
    pageSize,
    userId,
    isLocked,
    minBalance,
    maxBalance,
    sortBy,
    sortOrder,
  });

  if (!walletsResult.success) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-2xl font-bold">Quản lý ví</h1>
        <div className="text-red-500">
          Error: {walletsResult.error || "Failed to load wallets"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Quản lý ví</h1>
      <WalletsTable
        data={walletsResult.data!.wallets as any}
        total={walletsResult.data!.total}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}
