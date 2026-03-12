"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { DataTableConfig, PaginatedResult } from "@/types/data-table.types";
import { transactionColumns } from "./transaction-columns";
import { TransactionType } from "@/domain/entities/transaction.entity";

interface TransactionWithUser {
  id: number;
  walletId: number;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  metadata: any;
  createdAt: Date;
  wallet: {
    id: number;
    userId: number;
    user: {
      id: number;
      name: string;
      email: string;
    };
  };
}

interface TransactionsTableProps {
  data: TransactionWithUser[];
  total: number;
  page: number;
  pageSize: number;
}

export function TransactionsTable({
  data,
  total,
  page,
  pageSize,
}: TransactionsTableProps) {
  const result: PaginatedResult<TransactionWithUser> = useMemo(
    () => ({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }),
    [data, total, page, pageSize],
  );

  const tableConfig: DataTableConfig<TransactionWithUser> = {
    entityName: "giao dịch",
    columns: [
      ...transactionColumns,
      {
        key: "type",
        label: "Type Filter",
        filterable: true,
        filter: {
          type: "select",
          options: [
            { value: "TOP_UP", label: "Nạp tiền" },
            { value: "PURCHASE", label: "Mua hàng" },
            { value: "REFUND", label: "Hoàn tiền" },
            { value: "ADJUSTMENT", label: "Điều chỉnh" },
          ],
        },
        render: () => null,
      },
    ],
  };

  return <DataTable result={result} config={tableConfig} />;
}
