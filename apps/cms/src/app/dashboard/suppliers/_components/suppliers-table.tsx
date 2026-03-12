"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SupplierEntity } from "@/domain/entities/supplier.entity";
import { DataTable } from "@/components/ui/data-table";
import { DataTableConfig, PaginatedResult } from "@/types/data-table.types";
import { supplierColumns } from "./supplier-columns";
import { SupplierDialog } from "./supplier-dialog";
import { deleteSupplierAction, toggleSupplierActiveAction } from "../actions";
import { toast } from "sonner";
import { Pencil, Power, Trash2 } from "lucide-react";

interface SuppliersTableProps {
  data: SupplierEntity[];
  total: number;
  page: number;
  pageSize: number;
}

export function SuppliersTable({
  data,
  total,
  page,
  pageSize,
}: SuppliersTableProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<
    SupplierEntity | undefined
  >(undefined);

  const handleCreate = () => {
    setEditingSupplier(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (supplier: SupplierEntity) => {
    setEditingSupplier(supplier);
    setDialogOpen(true);
  };

  const handleToggleActive = async (supplier: SupplierEntity) => {
    const result = await toggleSupplierActiveAction(supplier.id);
    if (result.success) {
      toast.success(
        `Đã ${supplier.isActive ? "khóa" : "kích hoạt"} nhà cung cấp thành công`,
      );
      router.refresh();
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (supplier: SupplierEntity) => {
    if (!confirm(`Bạn có chắc muốn xóa nhà cung cấp "${supplier.name}"?`)) {
      return;
    }

    const result = await deleteSupplierAction(supplier.id);
    if (result.success) {
      toast.success("Xóa nhà cung cấp thành công");
      router.refresh();
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  const result: PaginatedResult<SupplierEntity> = useMemo(
    () => ({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }),
    [data, total, page, pageSize],
  );

  const tableConfig: DataTableConfig<SupplierEntity> = {
    entityName: "nhà cung cấp",
    addButtonLabel: "Thêm nhà cung cấp",
    onAdd: handleCreate,
    columns: [
      ...supplierColumns,
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
      <SupplierDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        supplier={editingSupplier}
        onSuccess={() => {
          setDialogOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
