"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { SchoolEntity } from "@/domain/entities/school.entity";
import { schoolColumns } from "./school-columns";
import { SchoolDialog } from "./school-dialog";
import { deleteSchoolAction, toggleSchoolActiveAction } from "../actions";
import type {
  DataTableConfig,
  PaginatedResult,
} from "@/types/data-table.types";
import { Pencil, Trash2, Power } from "lucide-react";
import { toast } from "sonner";

interface SchoolsTableProps {
  data: SchoolEntity[];
  total: number;
  page: number;
  pageSize: number;
}

export function SchoolsTable({
  data,
  total,
  page,
  pageSize,
}: SchoolsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState<string | number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolEntity | null>(
    null,
  );

  const handleToggleActive = async (school: SchoolEntity) => {
    setLoading(school.id);
    const result = await toggleSchoolActiveAction(school.id);
    setLoading(null);

    if (result.success) {
      toast.success("Cập nhật trạng thái thành công");
      startTransition(() => {
        router.refresh();
      });
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (school: SchoolEntity) => {
    if (!confirm(`Bạn có chắc muốn xóa trường "${school.name}"?`)) {
      return;
    }

    setLoading(school.id);
    const result = await deleteSchoolAction(school.id);
    setLoading(null);

    if (result.success) {
      toast.success("Xóa trường học thành công");
      startTransition(() => {
        router.refresh();
      });
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  const handleCreate = () => {
    setEditingSchool(null);
    setDialogOpen(true);
  };

  const handleEdit = (school: SchoolEntity) => {
    setEditingSchool(school);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    startTransition(() => {
      router.refresh();
    });
    setDialogOpen(false);
    setEditingSchool(null);
  };

  // Transform to PaginatedResult
  const result: PaginatedResult<SchoolEntity> = {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };

  // Configure table
  const tableConfig: DataTableConfig<SchoolEntity> = {
    entityName: "trường học",
    addButtonLabel: "Thêm trường học",
    onAdd: handleCreate,
    columns: schoolColumns,
    rowActions: [
      {
        label: "Chỉnh sửa",
        icon: <Pencil className="w-4 h-4" />,
        onClick: handleEdit,
      },
      {
        label: "Bật/Tắt",
        icon: <Power className="w-4 h-4" />,
        onClick: handleToggleActive,
      },
      {
        label: "Xóa",
        icon: <Trash2 className="w-4 h-4" />,
        onClick: handleDelete,
        variant: "destructive",
        separator: true,
      },
    ],
  };

  return (
    <>
      <DataTable config={tableConfig} result={result} />
      <SchoolDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        school={editingSchool}
        onSuccess={handleSuccess}
      />
    </>
  );
}
