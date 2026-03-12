import { VoucherEntity, DiscountType } from "@/domain/entities/voucher.entity";
import { DataTableColumn } from "@/types/data-table.types";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/format-date";

export const voucherColumns: DataTableColumn<VoucherEntity>[] = [
  {
    key: "code",
    label: "Mã voucher",
    sortable: true,
    filterable: true,
    filter: {
      type: "text",
      placeholder: "Tìm mã...",
    },
    render: (voucher: VoucherEntity) => (
      <span className="font-mono font-semibold">{voucher.code}</span>
    ),
  },
  {
    key: "description",
    label: "Mô tả",
    render: (voucher: VoucherEntity) =>
      voucher.description || <span className="text-muted-foreground">-</span>,
  },
  {
    key: "discount",
    label: "Giảm giá",
    sortable: true,
    render: (voucher: VoucherEntity) => {
      if (voucher.discountType === DiscountType.PERCENTAGE) {
        return (
          <span className="font-medium text-green-600">
            {voucher.discount}%
          </span>
        );
      }
      return (
        <span className="font-medium text-green-600">
          {new Intl.NumberFormat("vi-VN").format(voucher.discount)}₫
        </span>
      );
    },
  },
  {
    key: "discountType",
    label: "Loại",
    filterable: true,
    filter: {
      type: "select",
      options: [
        { value: "PERCENTAGE", label: "Phần trăm" },
        { value: "FIXED", label: "Cố định" },
      ],
    },
    render: (voucher: VoucherEntity) => (
      <Badge variant="outline">
        {voucher.discountType === DiscountType.PERCENTAGE ? "%" : "₫"}
      </Badge>
    ),
  },
  {
    key: "usageCount",
    label: "Đã dùng",
    render: (voucher: VoucherEntity) => {
      const limit = voucher.usageLimit;
      return (
        <div>
          <span className="font-medium">{voucher.usageCount}</span>
          {limit && <span className="text-muted-foreground"> / {limit}</span>}
        </div>
      );
    },
  },
  {
    key: "startsAt",
    label: "Bắt đầu",
    sortable: true,
    render: (voucher: VoucherEntity) => formatDate(voucher.startsAt),
  },
  {
    key: "expiresAt",
    label: "Hết hạn",
    sortable: true,
    render: (voucher: VoucherEntity) => {
      const isExpired = new Date(voucher.expiresAt) < new Date();
      return (
        <span className={isExpired ? "text-red-600" : ""}>
          {formatDate(voucher.expiresAt)}
        </span>
      );
    },
  },
  {
    key: "isActive",
    label: "Trạng thái",
    filterable: false,
    render: (voucher: VoucherEntity) => {
      const isExpired = new Date(voucher.expiresAt) < new Date();
      const isNotStarted = new Date(voucher.startsAt) > new Date();

      if (isExpired) {
        return <Badge variant="secondary">Hết hạn</Badge>;
      }
      if (isNotStarted) {
        return <Badge variant="outline">Chưa bắt đầu</Badge>;
      }
      return (
        <Badge variant={voucher.isActive ? "default" : "secondary"}>
          {voucher.isActive ? "Hoạt động" : "Khóa"}
        </Badge>
      );
    },
  },
];
