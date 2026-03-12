"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CategoryEntity } from "@/domain/entities/category.entity";
import { DataTable } from "@/components/ui/data-table";
import { DataTableConfig, PaginatedResult } from "@/types/data-table.types";
import { categoryColumns } from "./category-columns";
import { CategoryDialog } from "./category-dialog";
import {
  deleteCategoryAction,
  toggleCategoryActiveAction,
} from "../actions";
import { toast } from "sonner";
import { Pencil, Power, Trash2 } from "lucide-react";

interface CategoriesTableProps {
  data: CategoryEntity[];
  total: number;
  page: number;
  pageSize: number;
}

export function CategoriesTable({
  data,
  total,
  page,
  pageSize,
}: CategoriesTableProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    CategoryEntity | undefined
  >(undefined);

  const result: PaginatedResult<CategoryEntity> = useMemo(() => ({
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }), [data, total, page, pageSize]);

  const handleCreate = () => {
    setEditingCategory(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (category: CategoryEntity) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleToggleActive = async (category: CategoryEntity) => {
    const result = await toggleCategoryActiveAction(category.id);
    if (result.success) {
      toast.success(
        `Đã ${category.isActive ? "khóa" : "kích hoạt"} danh mục thành công`,
      );
      router.refresh();
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (category: CategoryEntity) => {
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
      return;
    }

    const result = await deleteCategoryAction(category.id);
    if (result.success) {
      toast.success("Xóa danh mục thành công");
      router.refresh();
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  const tableConfig: DataTableConfig<CategoryEntity> = {
    entityName: "danh mục",
    addButtonLabel: "Thêm danh mục",
    onAdd: handleCreate,
    columns: [
      ...categoryColumns,
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
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        onSuccess={() => {
          setDialogOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
