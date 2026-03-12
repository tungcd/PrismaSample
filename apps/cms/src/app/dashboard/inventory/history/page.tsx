import { getInventoryHistoryAction } from "../actions";
import { InventoryHistoryTable } from "./_components/inventory-history-table";

export const revalidate = 60; // Cache for 1 minute

interface InventoryHistoryPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    type?: string;
    productId?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function InventoryHistoryPage({
  searchParams,
}: InventoryHistoryPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const type = params.type as any;
  const productId = params.productId ? Number(params.productId) : undefined;
  const sortBy = (params.sortBy as any) || "createdAt";
  const sortOrder = (params.sortOrder as any) || "desc";

  const result = await getInventoryHistoryAction({
    page,
    pageSize,
    type,
    productId,
    sortBy,
    sortOrder,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lịch sử nhập/xuất kho</h1>
        <p className="text-muted-foreground">
          Theo dõi mọi thay đổi về tồn kho
        </p>
      </div>

      <InventoryHistoryTable
        transactions={result.transactions}
        total={result.total}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}
