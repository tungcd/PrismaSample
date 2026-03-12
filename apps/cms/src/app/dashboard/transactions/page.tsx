import { getAllTransactionsAction } from "./actions";
import { TransactionsTable } from "./_components/transactions-table";
import { TransactionType } from "@/domain/entities/transaction.entity";

// ISR: Cache for 30 seconds (financial transactions need frequent updates)
export const revalidate = 30;

interface TransactionsPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    type?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = parseInt(searchParams.pageSize || "10");
  const type = searchParams.type as TransactionType | undefined;
  const userId = searchParams.userId
    ? parseInt(searchParams.userId)
    : undefined;
  const startDate = searchParams.startDate
    ? new Date(searchParams.startDate)
    : undefined;
  const endDate = searchParams.endDate
    ? new Date(searchParams.endDate)
    : undefined;
  const sortBy = searchParams.sortBy as "createdAt" | "amount";
  const sortOrder = searchParams.sortOrder as "asc" | "desc";

  const transactionsResult = await getAllTransactionsAction({
    page,
    pageSize,
    type,
    userId,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  });

  if (!transactionsResult.success) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-2xl font-bold">Lịch sử giao dịch</h1>
        <div className="text-red-500">
          Error: {transactionsResult.error || "Failed to load transactions"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Lịch sử giao dịch</h1>
      <TransactionsTable
        data={transactionsResult.data!.transactions as any}
        total={transactionsResult.data!.total}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}
