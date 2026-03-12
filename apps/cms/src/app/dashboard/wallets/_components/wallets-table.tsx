"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { DataTableConfig, PaginatedResult } from "@/types/data-table.types";
import { walletColumns } from "./wallet-columns";
import { toggleWalletLockAction } from "../actions";
import { toast } from "sonner";
import { Lock, Unlock } from "lucide-react";

interface WalletWithUser {
  id: number;
  userId: number;
  balance: number;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
}

interface WalletsTableProps {
  data: WalletWithUser[];
  total: number;
  page: number;
  pageSize: number;
}

export function WalletsTable({
  data,
  total,
  page,
  pageSize,
}: WalletsTableProps) {
  const router = useRouter();

  const result: PaginatedResult<WalletWithUser> = useMemo(
    () => ({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }),
    [data, total, page, pageSize],
  );

  const handleToggleLock = async (wallet: WalletWithUser) => {
    const action = wallet.isLocked ? "mở khóa" : "khóa";
    if (!confirm(`Bạn có chắc muốn ${action} ví của "${wallet.user.name}"?`)) {
      return;
    }

    const result = await toggleWalletLockAction(wallet.id);
    if (result.success) {
      toast.success(`Đã ${action} ví thành công`);
      router.refresh();
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  const tableConfig: DataTableConfig<WalletWithUser> = {
    entityName: "ví",
    columns: [
      ...walletColumns,
      {
        key: "lockStatus",
        label: "Lock Status Filter",
        filterable: true,
        filter: {
          type: "select",
          options: [
            { value: "false", label: "Hoạt động" },
            { value: "true", label: "Đã khóa" },
          ],
        },
        render: () => null,
      },
    ],
    rowActions: [
      {
        label: (wallet: WalletWithUser) =>
          wallet.isLocked ? "Mở khóa" : "Khóa ví",
        icon: (wallet: WalletWithUser) =>
          wallet.isLocked ? (
            <Unlock className="h-4 w-4" />
          ) : (
            <Lock className="h-4 w-4" />
          ),
        onClick: handleToggleLock,
        variant: (wallet: WalletWithUser) =>
          wallet.isLocked ? "default" : "destructive",
      },
    ],
  };

  return <DataTable result={result} config={tableConfig} />;
}
