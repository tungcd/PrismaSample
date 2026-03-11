"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserEntity } from "@/domain/entities/user.entity";
import type { GetUsersResult } from "@/application/use-cases/user/get-all-users.use-case";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import type {
  DataTableConfig,
  PaginatedResult,
} from "@/types/data-table.types";
import { Pencil, Trash2, Power } from "lucide-react";
import { deleteUserAction, toggleUserActiveAction } from "../actions";
import { UserDialog } from "./user-dialog";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/lib/utils";

interface UsersTableProps {
  data: GetUsersResult;
}

export function UsersTable({ data }: UsersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserEntity | null>(null);

  const handleToggleActive = async (user: UserEntity) => {
    const result = await toggleUserActiveAction(user.id);
    if (result.success && result.data) {
      toast.success("Cập nhật trạng thái thành công");
      startTransition(() => {
        router.refresh();
      });
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (user: UserEntity) => {
    if (!confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    const result = await deleteUserAction(user.id);
    if (result.success) {
      toast.success("Xóa người dùng thành công");
      startTransition(() => {
        router.refresh();
      });
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  const handleEdit = (user: UserEntity) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    startTransition(() => {
      router.refresh();
    });
    setDialogOpen(false);
    setEditingUser(null);
  };

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; variant: any }> = {
      ADMIN: { label: "Admin", variant: "destructive" },
      MANAGER: { label: "Quản lý", variant: "default" },
      STAFF: { label: "Nhân viên", variant: "secondary" },
      PARENT: { label: "Phụ huynh", variant: "outline" },
    };
    const roleInfo = roleMap[role] || { label: role, variant: "outline" };
    return <Badge variant={roleInfo.variant as any}>{roleInfo.label}</Badge>;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hour = String(d.getHours()).padStart(2, "0");
    const minute = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hour}:${minute}`;
  };

  // Transform GetUsersResult to PaginatedResult
  const result: PaginatedResult<UserEntity> = {
    data: data.users,
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
    totalPages: data.totalPages,
  };

  // Configure table columns and behavior
  const tableConfig: DataTableConfig<UserEntity> = {
    entityName: "người dùng",
    addButtonLabel: "Thêm người dùng",
    onAdd: handleCreate,
    columns: [
      {
        key: "email",
        label: "Email",
        sortable: true,
        filterable: true,
        filter: {
          type: "text",
          placeholder: "Tìm email...",
        },
        className: "font-medium",
      },
      {
        key: "name",
        label: "Tên",
        sortable: true,
        filterable: true,
        filter: {
          type: "text",
          placeholder: "Tìm tên...",
        },
      },
      {
        key: "role",
        label: "Vai trò",
        sortable: true,
        filterable: true,
        filter: {
          type: "select",
          options: [
            { value: "ADMIN", label: "Admin" },
            { value: "MANAGER", label: "Quản lý" },
            { value: "STAFF", label: "Nhân viên" },
            { value: "PARENT", label: "Phụ huynh" },
          ],
        },
        render: (user) => getRoleBadge(user.role),
      },
      {
        key: "phone",
        label: "Số điện thoại",
        sortable: true,
        filterable: true,
        filter: {
          type: "text",
          placeholder: "Tìm SĐT...",
        },
        render: (user) => formatPhoneNumber(user.phone) || "-",
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
        render: (user) => (
          <Badge variant={user.isActive ? "default" : "secondary"}>
            {user.isActive ? "Hoạt động" : "Khóa"}
          </Badge>
        ),
      },
      {
        key: "lastLoginAt",
        label: "Đăng nhập lần cuối",
        render: (user) => (
          <span suppressHydrationWarning>{formatDate(user.lastLoginAt)}</span>
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

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser}
        onSuccess={handleSuccess}
      />
    </>
  );
}
