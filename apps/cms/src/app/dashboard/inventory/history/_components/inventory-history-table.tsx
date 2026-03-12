"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table/data-table";
import { inventoryHistoryColumns } from "./inventory-history-columns";
import { InventoryTransactionEntity } from "@/domain/entities/inventory-transaction.entity";
import { PaginatedResult, DataTableConfig } from "@/types/data-table.types";

interface InventoryHistoryTableProps {
  transactions: InventoryTransactionEntity[];
  total: number;
  page: number;
  pageSize: number;
}

export function InventoryHistoryTable({
  transactions,
  total,
  page,
  pageSize,
}: InventoryHistoryTableProps) {
  const paginatedResult: PaginatedResult<InventoryTransactionEntity> = useMemo(
    () => ({
      data: transactions,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }),
    [transactions, total, page, pageSize],
  );

  const tableConfig: DataTableConfig<InventoryTransactionEntity> = {
    entityName: "giao dịch kho",
    columns: inventoryHistoryColumns,
  };

  return <DataTable result={paginatedResult} config={tableConfig} />;
}
