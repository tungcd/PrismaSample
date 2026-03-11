# InfiniteSelectBox Component

## Overview

`InfiniteSelectBox` is a generic, reusable select component with infinite scroll pagination and search functionality. Built for performance with large datasets.

## Features

- ✅ **Infinite Scroll Pagination** - Automatically loads more items when scrolling
- 🔍 **Search** - Debounced search by any field (300ms delay)
- 🎯 **Smart Default Value** - Loads selected item even if not in first page
- 🔄 **Multiple Selection** - Optional multi-select mode
- 📦 **Generic Type-Safe** - Works with any entity that has `id` and `name`
- 🚀 **Server Actions** - Uses Prisma directly (no REST API needed)
- ♿ **Accessible** - Built on Radix UI primitives

## Installation

```bash
# Install required dependencies
pnpm add cmdk @radix-ui/react-icons @radix-ui/react-popover
```

Required components:

- `components/ui/command.tsx`
- `components/ui/popover.tsx`
- `components/ui/badge.tsx`
- `components/ui/button.tsx`

## Basic Usage

### 1. Create Server Action

```typescript
// app/actions/get-parents.action.ts
"use server";

import { prisma } from "@/infrastructure/database/prisma-client";
import {
  InfiniteSelectResult,
  SelectableEntity,
} from "@/components/ui/infinite-select-box";

export interface ParentSelectEntity extends SelectableEntity {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export async function getParentsForSelect(
  page: number,
  search: string,
): Promise<InfiniteSelectResult<ParentSelectEntity>> {
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const where = {
    role: "PARENT",
    deletedAt: null,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: pageSize + 1, // Fetch one extra to check hasMore
    }),
    prisma.user.count({ where }),
  ]);

  const hasMore = users.length > pageSize;
  const data = hasMore ? users.slice(0, pageSize) : users;

  return {
    data: data.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    })),
    hasMore,
  };
}

export async function getParentById(
  id: string | number,
): Promise<ParentSelectEntity | null> {
  const user = await prisma.user.findFirst({
    where: { id: id.toString(), role: "PARENT", deletedAt: null },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };
}
```

### 2. Use in Form

```typescript
// app/dashboard/students/_components/student-dialog.tsx
"use client";

import { InfiniteSelectBox } from "@/components/ui/infinite-select-box";
import {
  getParentsForSelect,
  getParentById,
  ParentSelectEntity,
} from "@/app/actions/get-parents.action";

export function StudentDialog() {
  const form = useForm<StudentInput>();

  return (
    <form>
      <Label>Phụ huynh *</Label>
      <InfiniteSelectBox<ParentSelectEntity>
        fetchFn={getParentsForSelect}
        fetchByIdFn={getParentById}
        value={form.watch("parentId")}
        onChange={(value) => form.setValue("parentId", value as string)}
        placeholder="Chọn phụ huynh"
        searchPlaceholder="Tìm theo tên, email, số điện thoại..."
        renderOption={(parent) => (
          <div className="flex flex-col">
            <span className="font-medium">{parent.name}</span>
            <span className="text-xs text-muted-foreground">
              {parent.email}
              {parent.phone && ` • ${parent.phone}`}
            </span>
          </div>
        )}
        error={form.formState.errors.parentId?.message}
      />
    </form>
  );
}
```

## Advanced Usage

### Multiple Selection

```typescript
<InfiniteSelectBox<ParentSelectEntity>
  multiple={true}
  value={[1, 2, 3]} // Array of IDs
  onChange={(ids) => console.log(ids)} // number[] | string[]
  fetchFn={getParentsForSelect}
  fetchByIdFn={getParentById}
/>
```

### Custom Rendering

```typescript
<InfiniteSelectBox<ProductEntity>
  fetchFn={getProducts}
  renderOption={(product) => (
    <div className="flex items-center gap-2">
      <img src={product.image} className="h-8 w-8 rounded" />
      <div>
        <div className="font-medium">{product.name}</div>
        <div className="text-xs text-muted-foreground">
          ${product.price}
        </div>
      </div>
    </div>
  )}
/>
```

## API Reference

### Props

```typescript
interface InfiniteSelectBoxProps<T extends SelectableEntity> {
  // Required
  fetchFn: (page: number, search: string) => Promise<InfiniteSelectResult<T>>;

  // Optional
  multiple?: boolean; // Enable multi-select (default: false)
  value?: string | number | (string | number)[]; // Current value(s)
  defaultValue?: string | number | (string | number)[]; // Default value(s)
  onChange?: (value: string | number | (string | number)[] | undefined) => void;
  placeholder?: string; // Button placeholder
  searchPlaceholder?: string; // Search input placeholder
  disabled?: boolean;
  renderOption?: (item: T) => React.ReactNode; // Custom option renderer
  pageSize?: number; // Items per page (default: 20)
  fetchByIdFn?: (id: string | number) => Promise<T | null>; // For smart default
  className?: string;
  error?: string; // Error message
}
```

### Entity Interface

```typescript
interface SelectableEntity {
  id: string | number;
  name: string;
}
```

### Return Type

```typescript
interface InfiniteSelectResult<T> {
  data: T[];
  hasMore: boolean;
}
```

## Performance Tips

1. **Use `take: pageSize + 1`** in Prisma query to efficiently check `hasMore`
2. **Index search fields** in database for fast search
3. **Debounce is automatic** - no need to implement manually
4. **fetchByIdFn is optional** - only needed if default value might not be in page 1

## Examples

### Simple Select

```typescript
<InfiniteSelectBox
  fetchFn={getUsers}
  value={userId}
  onChange={setUserId}
  placeholder="Select user"
/>
```

### With Search Fields

```typescript
// Server Action
const where = {
  ...(search && {
    OR: [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ],
  }),
};
```

### With Custom Rendering

```typescript
<InfiniteSelectBox
  fetchFn={getSchools}
  renderOption={(school) => (
    <>
      <span className="font-medium">{school.name}</span>
      <span className="text-xs text-muted-foreground ml-auto">
        {school.district}
      </span>
    </>
  )}
/>
```

## Troubleshooting

### "Cannot find selected item"

Make sure to provide `fetchByIdFn` when editing existing records:

```typescript
<InfiniteSelectBox
  fetchFn={getItems}
  fetchByIdFn={getItemById} // Important for edit mode
  value={existingId}
/>
```

### Slow search

Add database indexes:

```prisma
model User {
  @@index([name])
  @@index([email])
}
```

### TypeScript errors

Ensure your entity extends `SelectableEntity`:

```typescript
interface MyEntity extends SelectableEntity {
  id: string; // or number
  name: string;
  // ... other fields
}
```

## Migration from Old Select

### Before (Old)

```typescript
const [items, setItems] = useState([]);

useEffect(() => {
  fetch("/api/items").then((res) => setItems(res.json()));
}, []);

<Select>
  {items.map((item) => (
    <SelectItem value={item.id}>{item.name}</SelectItem>
  ))}
</Select>;
```

### After (InfiniteSelectBox)

```typescript
<InfiniteSelectBox fetchFn={getItems} value={value} onChange={onChange} />
```

**Benefits:**

- ❌ No useState
- ❌ No useEffect
- ❌ No fetch/API route
- ✅ Pagination built-in
- ✅ Search built-in
- ✅ Type-safe with Prisma
