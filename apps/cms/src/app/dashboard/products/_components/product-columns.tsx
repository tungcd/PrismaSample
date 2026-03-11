import { DataTableColumn } from "@/types/data-table.types";
import { ProductEntity } from "@/domain/entities/product.entity";

export const productColumns: DataTableColumn<ProductEntity>[] = [
  {
    key: "id",
    label: "ID",
    sortable: true,
    filterable: false,
    render: (row: ProductEntity) => (
      <span className="font-mono text-sm">{row.id}</span>
    ),
  },
  {
    key: "name",
    label: "Tên sản phẩm",
    sortable: true,
    filterable: true,
    filter: {
      type: "text",
      placeholder: "Tìm theo tên...",
    },
    render: (row: ProductEntity) => (
      <div className="flex items-center gap-3">
        {row.images && row.images.length > 0 ? (
          <img
            src={row.images[0]}
            alt={row.name}
            className="w-10 h-10 rounded object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-500">No img</span>
          </div>
        )}
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-gray-500">{row.slug}</div>
        </div>
      </div>
    ),
  },
  {
    key: "price",
    label: "Giá",
    sortable: true,
    filterable: false,
    render: (row: ProductEntity) => (
      <span className="font-semibold text-green-600">
        {row.price.toLocaleString("vi-VN")} đ
      </span>
    ),
  },
  {
    key: "stock",
    label: "Tồn kho",
    sortable: true,
    filterable: false,
    render: (row: ProductEntity) => {
      let stockColor = "text-red-600";
      let stockLabel = "Hết hàng";

      if (row.stock > 10) {
        stockColor = "text-green-600";
        stockLabel = "Còn hàng";
      } else if (row.stock > 0) {
        stockColor = "text-yellow-600";
        stockLabel = "Sắp hết";
      }

      return (
        <div>
          <div className={`font-semibold ${stockColor}`}>{row.stock}</div>
          <div className={`text-xs ${stockColor}`}>{stockLabel}</div>
        </div>
      );
    },
  },
  {
    key: "category",
    label: "Danh mục",
    sortable: false,
    filterable: false,
    render: (row: ProductEntity) => (
      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
        {row.category?.name}
      </span>
    ),
  },
  {
    key: "isFeatured",
    label: "Nổi bật",
    sortable: false,
    filterable: false,
    render: (row: ProductEntity) =>
      row.isFeatured ? (
        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
          Nổi bật
        </span>
      ) : null,
  },
  {
    key: "isActive",
    label: "Trạng thái",
    sortable: false,
    filterable: false,
    render: (row: ProductEntity) => (
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
