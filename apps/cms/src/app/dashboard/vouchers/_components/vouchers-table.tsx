"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { VoucherEntity } from "@/domain/entities/voucher.entity";
import { DataTable } from "@/components/ui/data-table";
import { DataTableConfig, PaginatedResult } from "@/types/data-table.types";
import { voucherColumns } from "./voucher-columns";
import { VoucherDialog } from "./voucher-dialog";
import { deleteVoucherAction, toggleVoucherActiveAction } from "../actions";
import { toast } from "sonner";
import { Pencil, Power, Trash2 } from "lucide-react";

interface VouchersTableProps {
  data: VoucherEntity[];
  total: number;
  page: number;
  pageSize: number;
}

export function VouchersTable({
  data,
  total,
  page,
  pageSize,
}: VouchersTableProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<
    VoucherEntity | undefined
  >(undefined);

  const result: PaginatedResult<VoucherEntity> = useMemo(
    () => ({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }),
    [data, total, page, pageSize],
  );

  const handleCreate = () => {
    setEditingVoucher(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (voucher: VoucherEntity) => {
    setEditingVoucher(voucher);
    setDialogOpen(true);
  };

  const handleToggleActive = async (voucher: VoucherEntity) => {
    const result = await toggleVoucherActiveAction(voucher.id);
    if (result.success) {
      toast.success(
        `Đã ${voucher.isActive ? "khóa" : "kích hoạt"} voucher thành công`,
      );
      router.refresh();
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (voucher: VoucherEntity) => {
    if (!confirm(`Bạn có chắc muốn xóa voucher "${voucher.code}"?`)) {
      return;
    }

    const result = await deleteVoucherAction(voucher.id);
    if (result.success) {
      toast.success("Xóa voucher thành công");
      router.refresh();
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  const tableConfig: DataTableConfig<VoucherEntity> = {
    entityName: "voucher",
    addButtonLabel: "Thêm voucher",
    onAdd: handleCreate,
    columns: [
      ...voucherColumns,
      {
        key: "status",
        label: "Status Filter",
        filterable: true,
        filter: {
          type: "select",
          options: [
            { value: "active", label: "Hoạt động" },
            { value: "inactive", label: "Khóa" },
          ],
        },
        render: () => null,
      },
    ],
    rowActions: [
      {
        label: "Chỉnh sửa",
        icon: <Pencil className="h-4 w-4" />,
        onClick: handleEdit,
      },
      {
        label: "Bật/Tắt",
        icon: <Power className="h-4 w-4" />,
        onClick: handleToggleActive,
      },
      {
        label: "Xóa",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: handleDelete,
        variant: "destructive",
      },
    ],
  };

  return (
    <>
      <DataTable result={result} config={tableConfig} />
      <VoucherDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        voucher={editingVoucher}
        onSuccess={() => {
          setDialogOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
