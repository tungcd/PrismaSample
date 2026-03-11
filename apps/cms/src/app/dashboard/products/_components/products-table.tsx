"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ProductEntity } from "@/domain/entities/product.entity";
import { productColumns } from "./product-columns";
import { ProductDialog } from "./product-dialog";
import { deleteProductAction, toggleProductActiveAction } from "../actions";
import type {
  DataTableConfig,
  PaginatedResult,
} from "@/types/data-table.types";
import { Pencil, Trash2, Power } from "lucide-react";
import { toast } from "sonner";

interface ProductsTableProps {
  data: ProductEntity[];
  total: number;
  page: number;
  pageSize: number;
  categoryOptions: { value: string; label: string }[];
}

export function ProductsTable({
  data,
  total,
  page,
  pageSize,
  categoryOptions,
}: ProductsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState<string | number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductEntity | null>(
    null,
  );

  const handleToggleActive = async (product: ProductEntity) => {
    setLoading(product.id);
    const result = await toggleProductActiveAction(product.id);
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

  const handleDelete = async (product: ProductEntity) => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) {
      return;
    }

    setLoading(product.id);
    const result = await deleteProductAction(product.id);
    setLoading(null);

    if (result.success) {
      toast.success("Xóa sản phẩm thành công");
      startTransition(() => {
        router.refresh();
      });
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const handleEdit = (product: ProductEntity) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    startTransition(() => {
      router.refresh();
    });
    setDialogOpen(false);
    setEditingProduct(null);
  };

  // Transform to PaginatedResult
  const result: PaginatedResult<ProductEntity> = {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };

  // Configure table
  const tableConfig: DataTableConfig<ProductEntity> = {
    entityName: "sản phẩm",
    addButtonLabel: "Thêm sản phẩm",
    onAdd: handleCreate,
    columns: [
      ...productColumns,
      {
        key: "categoryId",
        label: "Category Filter",
        filterable: true,
        filter: {
          type: "select",
          options: [...categoryOptions],
        },
        render: () => null, // Hidden column for filtering only
      },
      {
        key: "status",
        label: "Status Filter",
        filterable: true,
        filter: {
          type: "select",
          options: [
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ],
        },
        render: () => null,
      },
      {
        key: "stock",
        label: "Stock Filter",
        filterable: true,
        filter: {
          type: "select",
          options: [
            { value: "in_stock", label: "In Stock (>10)" },
            { value: "low_stock", label: "Low Stock (1-10)" },
            { value: "out_of_stock", label: "Out of Stock" },
          ],
        },
        render: () => null,
      },
      {
        key: "isFeatured",
        label: "Featured Filter",
        filterable: true,
        filter: {
          type: "select",
          options: [
            { value: "true", label: "Featured" },
            { value: "false", label: "Not Featured" },
          ],
        },
        render: () => null,
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
      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        onSuccess={handleSuccess}
        categoryOptions={categoryOptions}
      />
    </>
  );
}
