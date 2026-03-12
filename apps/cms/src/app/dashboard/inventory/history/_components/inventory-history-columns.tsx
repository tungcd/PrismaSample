"use client";

import { DataTableColumn } from "@/types/data-table.types";
import {
  InventoryTransactionEntity,
  InventoryType,
} from "@/domain/entities/inventory-transaction.entity";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format-date";
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from "lucide-react";

export const inventoryHistoryColumns: DataTableColumn<InventoryTransactionEntity>[] =
  [
    {
      key: "id",
      label: "ID",
      sortable: true,
      filterable: false,
      render: (transaction: InventoryTransactionEntity) => (
        <span className="font-mono text-sm">#{transaction.id}</span>
      ),
    },
    {
      key: "product",
      label: "Sản phẩm",
      sortable: false,
      filterable: false,
      render: (transaction: InventoryTransactionEntity) => (
        <div>
          <div className="font-medium">{transaction.product?.name}</div>
          <div className="text-sm text-muted-foreground">
            #{transaction.productId}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Loại",
      sortable: false,
      filterable: true,
      filter: {
        type: "select",
        options: [
          { value: InventoryType.IN, label: "Nhập kho" },
          { value: InventoryType.OUT, label: "Xuất kho" },
          { value: InventoryType.ADJUSTMENT, label: "Điều chỉnh" },
        ],
      },
      render: (transaction: InventoryTransactionEntity) => {
        const type = transaction.type;

        if (type === InventoryType.IN) {
          return (
            <Badge variant="default" className="gap-1">
              <ArrowUpCircle className="h-3 w-3" />
              Nhập kho
            </Badge>
          );
        }

        if (type === InventoryType.OUT) {
          return (
            <Badge variant="destructive" className="gap-1">
              <ArrowDownCircle className="h-3 w-3" />
              Xuất kho
            </Badge>
          );
        }

        return (
          <Badge variant="secondary" className="gap-1">
            <RefreshCw className="h-3 w-3" />
            Điều chỉnh
          </Badge>
        );
      },
    },
    {
      key: "quantity",
      label: "Số lượng",
      sortable: true,
      filterable: false,
      render: (transaction: InventoryTransactionEntity) => {
        const quantity = transaction.quantity;
        const isPositive = quantity > 0;

        return (
          <span
            className={`font-semibold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {quantity}
          </span>
        );
      },
    },
    {
      key: "reason",
      label: "Lý do",
      sortable: false,
      filterable: false,
      render: (transaction: InventoryTransactionEntity) => (
        <span className="text-sm">{transaction.reason || "—"}</span>
      ),
    },
    {
      key: "user",
      label: "Người thực hiện",
      sortable: false,
      filterable: false,
      render: (transaction: InventoryTransactionEntity) => (
        <div>
          <div className="font-medium">{transaction.user?.name}</div>
          <div className="text-sm text-muted-foreground">
            {transaction.user?.email}
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Thời gian",
      sortable: true,
      filterable: false,
      render: (transaction: InventoryTransactionEntity) => (
        <span className="text-sm">{formatDateTime(transaction.createdAt)}</span>
      ),
    },
  ];
