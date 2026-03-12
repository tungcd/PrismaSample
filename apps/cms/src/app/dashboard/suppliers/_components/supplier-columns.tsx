import { SupplierEntity } from "@/domain/entities/supplier.entity";
import { DataTableColumn } from "@/types/data-table.types";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format-date";

export const supplierColumns: DataTableColumn<SupplierEntity>[] = [
  {
    key: "id",
    label: "ID",
    sortable: true,
    render: (supplier: SupplierEntity) => (
      <span className="font-mono">{supplier.id}</span>
    ),
  },
  {
    key: "name",
    label: "Tên nhà cung cấp",
    sortable: true,
  },
  {
    key: "email",
    label: "Email",
    render: (supplier: SupplierEntity) =>
      supplier.email || <span className="text-muted-foreground">-</span>,
  },
  {
    key: "phone",
    label: "Số điện thoại",
    render: (supplier: SupplierEntity) =>
      supplier.phone || <span className="text-muted-foreground">-</span>,
  },
  {
    key: "address",
    label: "Địa chỉ",
    render: (supplier: SupplierEntity) =>
      supplier.address || <span className="text-muted-foreground">-</span>,
  },
  {
    key: "isActive",
    label: "Trạng thái",
    filterable: false,
    render: (supplier: SupplierEntity) => (
      <Badge variant={supplier.isActive ? "default" : "secondary"}>
        {supplier.isActive ? "Hoạt động" : "Khóa"}
      </Badge>
    ),
  },
  {
    key: "createdAt",
    label: "Ngày tạo",
    sortable: true,
    render: (supplier: SupplierEntity) => formatDate(supplier.createdAt),
  },
];
