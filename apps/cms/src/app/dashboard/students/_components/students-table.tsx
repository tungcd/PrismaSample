"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StudentEntity } from "@/domain/entities/student.entity";
import type { GetStudentsResult } from "@/application/use-cases/student/get-all-students.use-case";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import type {
  DataTableConfig,
  PaginatedResult,
} from "@/types/data-table.types";
import { Pencil, Trash2, Power } from "lucide-react";
import { deleteStudentAction, toggleStudentActiveAction } from "../actions";
import { GRADES, StudentDialog } from "./student-dialog";
import { SchoolSelectEntity } from "@/app/actions/get-schools.action";
import { toast } from "sonner";

interface StudentsTableProps {
  data: GetStudentsResult;
  schools: SchoolSelectEntity[];
}

export function StudentsTable({ data, schools }: StudentsTableProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentEntity | null>(
    null,
  );

  const handleToggleActive = async (student: StudentEntity) => {
    const result = await toggleStudentActiveAction(student.id);
    if (result.success && result.data) {
      toast.success("Cập nhật trạng thái thành công");
      router.refresh();
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (student: StudentEntity) => {
    if (!confirm("Bạn có chắc muốn xóa học sinh này?")) return;
    const result = await deleteStudentAction(student.id);
    if (result.success) {
      toast.success("Xóa học sinh thành công");
      router.refresh();
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  const handleEdit = (student: StudentEntity) => {
    setEditingStudent(student);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingStudent(null);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    router.refresh();
    setDialogOpen(false);
    setEditingStudent(null);
  };

  // Transform GetStudentsResult to PaginatedResult
  const result: PaginatedResult<StudentEntity> = {
    data: data.students,
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
    totalPages: data.totalPages,
  };

  // Configure table columns and behavior
  const tableConfig: DataTableConfig<StudentEntity> = {
    entityName: "học sinh",
    addButtonLabel: "Thêm học sinh",
    onAdd: handleCreate,
    columns: [
      {
        key: "cardNumber",
        label: "Mã thẻ",
        sortable: true,
        filterable: true,
        filter: {
          type: "text",
          placeholder: "Tìm mã thẻ...",
        },
        className: "font-medium font-mono",
      },
      {
        key: "name",
        label: "Tên học sinh",
        sortable: true,
        filterable: true,
        filter: {
          type: "text",
          placeholder: "Tìm tên...",
        },
      },
      {
        key: "grade",
        label: "Lớp",
        sortable: true,
        filterable: true,
        filter: {
          type: "select",
          options: GRADES.map((grade) => ({ value: grade, label: grade })),
        },
        render: (student) => <Badge variant="outline">{student.grade}</Badge>,
      },
      {
        key: "school",
        label: "Trường",
        sortable: true,
        filterable: true,
        filter: {
          type: "select",
          options: schools.map((school) => ({
            value: school.name,
            label: school.name,
          })),
        },
      },
      {
        key: "parent",
        label: "Phụ huynh",
        render: (student) => student.parent?.name || "-",
      },
      {
        key: "status",
        label: "Trạng thái",
        filterable: true,
        filter: {
          type: "select",
          options: [
            { value: "active", label: "Hoạt động" },
            { value: "inactive", label: "Khóa" },
          ],
        },
        render: (student) => (
          <Badge variant={student.isActive ? "default" : "secondary"}>
            {student.isActive ? "Hoạt động" : "Khóa"}
          </Badge>
        ),
      },
    ],
    rowActions: [
      {
        label: "Sửa",
        icon: <Pencil className="h-4 w-4" />,
        onClick: handleEdit,
      },
      {
        label: "Khóa/Kích hoạt",
        icon: <Power className="h-4 w-4" />,
        onClick: handleToggleActive,
      },
      {
        label: "Xóa",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: handleDelete,
        variant: "destructive",
        separator: true,
      },
    ],
  };

  return (
    <>
      <DataTable result={result} config={tableConfig} />

      <StudentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        student={editingStudent}
        onSuccess={handleSuccess}
      />
    </>
  );
}
