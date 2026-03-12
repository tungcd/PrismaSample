import { CategoryEntity } from "@/domain/entities/category.entity";
import { DataTableColumn } from "@/types/data-table.types";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format-date";

export const categoryColumns: DataTableColumn<CategoryEntity>[] = [
  {
    key: "id",
    label: "ID",
    sortable: true,
    render: (category: CategoryEntity) => (
      <span className="font-mono">{category.id}</span>
    ),
  },
  {
    key: "name",
    label: "Tên danh mục",
    sortable: true,
  },
  {
    key: "slug",
    label: "Slug",
    render: (category: CategoryEntity) => (
      <span className="font-mono text-sm text-muted-foreground">
        {category.slug}
      </span>
    ),
  },
  {
    key: "sortOrder",
    label: "Thứ tự",
    sortable: true,
    render: (category: CategoryEntity) => (
      <span className="text-center">{category.sortOrder}</span>
    ),
  },
  {
    key: "isActive",
    label: "Trạng thái",
    filterable: false,
    render: (category: CategoryEntity) => (
      <Badge variant={category.isActive ? "default" : "secondary"}>
        {category.isActive ? "Hoạt động" : "Khóa"}
      </Badge>
    ),
  },
  {
    key: "createdAt",
    label: "Ngày tạo",
    sortable: true,
    render: (category: CategoryEntity) => formatDate(category.createdAt),
  },
];
