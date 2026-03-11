# Generic DataTable Component

Component DataTable có thể tái sử dụng cho tất cả các màn hình list/table với đầy đủ tính năng filter, sort, pagination server-side.

## Features

- ✅ **Server-side Filtering** - URL params + database query
- ✅ **Server-side Sorting** - Click header to sort
- ✅ **Server-side Pagination** - First/Prev/Next/Last + Page size
- ✅ **Debounced Text Filters** - 500ms debounce tự động
- ✅ **Select Filters** - Dropdown for predefined options
- ✅ **Row Actions** - Edit/Delete/Custom actions per row
- ✅ **Flexible Render** - Custom cell rendering
- ✅ **TypeScript Generic** - Type-safe với mọi entity

## File Structure

```
src/
├── types/
│   └── data-table.types.ts          # Type definitions
├── components/ui/data-table/
│   ├── data-table.tsx                # Main component
│   ├── data-table-column-header.tsx  # Sortable header
│   ├── data-table-pagination.tsx     # Pagination controls
│   └── index.ts                      # Barrel export
```

## Usage Example

### 1. Backend Setup (Use Case & Repository)

```typescript
// use-case interface
export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  email?: string;
  name?: string;
  role?: string;
  phone?: string;
  status?: string;
  sortBy?: "email" | "name" | "role" | "phone";
  sortOrder?: "asc" | "desc";
}

export interface GetUsersResult {
  users: UserEntity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// use-case implementation
export class GetAllUsersUseCase {
  async execute(params: GetUsersParams = {}): Promise<GetUsersResult> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const { users, total } = await this.userRepository.findMany(params);

    return {
      users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

// repository implementation
async findMany(params: GetUsersParams = {}): Promise<{ users: UserEntity[]; total: number }> {
  const { page = 1, pageSize = 10, email, name, role, phone, status, sortBy = "createdAt", sortOrder = "desc" } = params;

  const where: any = { deletedAt: null };
  if (email) where.email = { contains: email, mode: "insensitive" };
  if (name) where.name = { contains: name, mode: "insensitive" };
  if (role && role !== "all") where.role = role;
  if (phone) where.phone = { contains: phone };
  if (status && status !== "all") where.isActive = status === "active";

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
}
```

### 2. Server Component (Page)

```typescript
// app/dashboard/users/page.tsx
interface UsersPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    email?: string;
    name?: string;
    role?: string;
    phone?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = {
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    pageSize: searchParams.pageSize ? parseInt(searchParams.pageSize) : 10,
    email: searchParams.email,
    name: searchParams.name,
    role: searchParams.role,
    phone: searchParams.phone,
    status: searchParams.status,
    sortBy: searchParams.sortBy as any,
    sortOrder: searchParams.sortOrder as any,
  };

  const result = await getAllUsersUseCase.execute(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Người dùng</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý thông tin người dùng trong hệ thống
          </p>
        </div>
      </div>

      <UsersTable data={result} />
    </div>
  );
}
```

### 3. Client Component (Table)

```typescript
// app/dashboard/users/_components/users-table.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserEntity } from "@/domain/entities/user.entity";
import type { GetUsersResult } from "@/application/use-cases/user/get-all-users.use-case";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableConfig, PaginatedResult } from "@/types/data-table.types";
import { Pencil, Trash2, Power } from "lucide-react";
import { deleteUserAction, toggleUserActiveAction } from "../actions";
import { UserDialog } from "./user-dialog";
import { toast } from "sonner";

interface UsersTableProps {
  data: GetUsersResult;
}

export function UsersTable({ data }: UsersTableProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserEntity | null>(null);

  const handleToggleActive = async (user: UserEntity) => {
    const result = await toggleUserActiveAction(user.id);
    if (result.success && result.data) {
      toast.success("Cập nhật trạng thái thành công");
      router.refresh();
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (user: UserEntity) => {
    if (!confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    const result = await deleteUserAction(user.id);
    if (result.success) {
      toast.success("Xóa người dùng thành công");
      router.refresh();
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
    router.refresh();
    setDialogOpen(false);
    setEditingUser(null);
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
        render: (user) => {
          const roleMap: Record<string, { label: string; variant: any }> = {
            ADMIN: { label: "Admin", variant: "destructive" },
            MANAGER: { label: "Quản lý", variant: "default" },
            STAFF: { label: "Nhân viên", variant: "secondary" },
            PARENT: { label: "Phụ huynh", variant: "outline" },
          };
          const roleInfo = roleMap[user.role] || { label: user.role, variant: "outline" };
          return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
        },
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
        render: (user) => user.phone || "-",
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
        render: (user) => {
          if (!user.lastLoginAt) return "-";
          const d = new Date(user.lastLoginAt);
          const day = String(d.getDate()).padStart(2, "0");
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const year = d.getFullYear();
          const hour = String(d.getHours()).padStart(2, "0");
          const minute = String(d.getMinutes()).padStart(2, "0");
          return <span suppressHydrationWarning>{`${day}/${month}/${year} ${hour}:${minute}`}</span>;
        },
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
```

## Column Configuration

### Text Filter

```typescript
{
  key: "email",
  label: "Email",
  sortable: true,
  filterable: true,
  filter: {
    type: "text",
    placeholder: "Tìm email...",
    debounce: true, // Optional, default true (500ms)
  },
}
```

### Select Filter

```typescript
{
  key: "role",
  label: "Vai trò",
  sortable: true,
  filterable: true,
  filter: {
    type: "select",
    options: [
      { value: "ADMIN", label: "Admin" },
      { value: "PARENT", label: "Phụ huynh" },
    ],
  },
}
```

### Custom Render

```typescript
{
  key: "role",
  label: "Vai trò",
  render: (item) => (
    <Badge variant="default">{item.role}</Badge>
  ),
}
```

### No Filter/Sort

```typescript
{
  key: "avatar",
  label: "Avatar",
  // No sortable/filterable - just display
  render: (item) => (
    <img src={item.avatar} className="w-8 h-8 rounded-full" />
  ),
}
```

## Row Actions Configuration

```typescript
rowActions: [
  {
    label: "Sửa",
    icon: <Pencil className="h-4 w-4" />,
    onClick: (item) => handleEdit(item),
  },
  {
    label: "Xóa",
    icon: <Trash2 className="h-4 w-4" />,
    onClick: (item) => handleDelete(item),
    variant: "destructive",  // Red text
    separator: true,         // Add separator above
  },
]
```

## API Types

```typescript
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filter?: ColumnFilter;
  render?: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface ColumnFilter {
  type: "text" | "select";
  placeholder?: string;
  options?: SelectOption[];
  debounce?: boolean;
}

export interface RowAction<T> {
  label: string;
  icon?: ReactNode;
  onClick: (item: T) => void | Promise<void>;
  variant?: "default" | "destructive";
  separator?: boolean;
}

export interface DataTableConfig<T> {
  columns: DataTableColumn<T>[];
  rowActions?: RowAction<T>[];
  onAdd?: () => void;
  addButtonLabel?: string;
  emptyMessage?: string;
  entityName?: string;
}
```

## URL Params Format

```
?page=2&pageSize=20&email=parent&name=nguyen&role=PARENT&status=active&sortBy=name&sortOrder=asc
```

- **page**: Current page number
- **pageSize**: Items per page (10/20/50/100)
- **Column filters**: Each filterable column adds its own param
- **sortBy**: Column key to sort
- **sortOrder**: "asc" or "desc"

## Benefits

1. **Code từ 450 dòng → 200 dòng** - Giảm 55% code
2. **Tái sử dụng 100%** - Chỉ config columns, không code lại
3. **Type-safe** - Generic TypeScript
4. **Debounce tự động** - Text filters debounce 500ms
5. **Consistent UX** - Tất cả table đồng nhất
6. **Server-side** - Filter/sort/pagination từ database
7. **URL-based** - Bookmark/share được URL với filters

## Quick Start for New Table

1. **Backend**: CreateGetXxxParams, GetXxxResult, repository.findMany()
2. **Page**: Parse searchParams → call use case → pass to table
3. **Table**: Config columns + rowActions → `<DataTable />`

Done! ✅
