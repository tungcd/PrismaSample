import { DataTableColumn } from "@/types/data-table.types";
import { SchoolEntity } from "@/domain/entities/school.entity";

export const schoolColumns: DataTableColumn<SchoolEntity>[] = [
  {
    key: "id",
    label: "ID",
    sortable: true,
    filterable: false,
    render: (row: SchoolEntity) => (
      <span className="font-mono text-sm">{row.id}</span>
    ),
  },
  {
    key: "name",
    label: "Tên trường",
    sortable: true,
    filterable: true,
    filter: {
      type: "text",
      placeholder: "Tìm theo tên...",
    },
    render: (row: SchoolEntity) => (
      <div className="font-medium">{row.name}</div>
    ),
  },
  {
    key: "address",
    label: "Địa chỉ",
    sortable: false,
    filterable: false,
    render: (row: SchoolEntity) => (
      <span className="text-sm text-gray-600">{row.address || "-"}</span>
    ),
  },
  {
    key: "phone",
    label: "Điện thoại",
    sortable: false,
    filterable: false,
    render: (row: SchoolEntity) => (
      <span className="text-sm">{row.phone || "-"}</span>
    ),
  },
  {
    key: "email",
    label: "Email",
    sortable: false,
    filterable: false,
    render: (row: SchoolEntity) => (
      <span className="text-sm">{row.email || "-"}</span>
    ),
  },
  {
    key: "isActive",
    label: "Trạng thái",
    sortable: false,
    filterable: true,
    filter: {
      type: "select",
      options: [
        { label: "Hoạt động", value: "active" },
        { label: "Khóa", value: "inactive" },
      ],
    },
    render: (row: SchoolEntity) => (
      <span
        className={`px-2 py-1 text-xs rounded ${
          row.isActive
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {row.isActive ? "Hoạt động" : "Khóa"}
      </span>
    ),
  },
];
