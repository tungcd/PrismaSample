import { DataTableColumn } from "@/types/data-table.types";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format-date";

interface WalletWithUser {
  id: number;
  userId: number;
  balance: number;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
}

export const walletColumns: DataTableColumn<WalletWithUser>[] = [
  {
    key: "id",
    label: "ID",
    sortable: false,
    render: (wallet: WalletWithUser) => (
      <span className="font-mono">{wallet.id}</span>
    ),
  },
  {
    key: "user",
    label: "Người dùng",
    render: (wallet: WalletWithUser) => (
      <div>
        <div className="font-medium">{wallet.user.name}</div>
        <div className="text-sm text-muted-foreground">{wallet.user.email}</div>
        {wallet.user.phone && (
          <div className="text-sm text-muted-foreground">
            {wallet.user.phone}
          </div>
        )}
      </div>
    ),
  },
  {
    key: "balance",
    label: "Số dư",
    sortable: true,
    render: (wallet: WalletWithUser) => (
      <span className="text-lg font-semibold">
        {new Intl.NumberFormat("vi-VN").format(Number(wallet.balance))}₫
      </span>
    ),
  },
  {
    key: "isLocked",
    label: "Trạng thái",
    filterable: false,
    render: (wallet: WalletWithUser) => (
      <Badge variant={wallet.isLocked ? "destructive" : "default"}>
        {wallet.isLocked ? "Đã khóa" : "Hoạt động"}
      </Badge>
    ),
  },
  {
    key: "createdAt",
    label: "Ngày tạo",
    sortable: true,
    render: (wallet: WalletWithUser) => formatDate(wallet.createdAt),
  },
  {
    key: "updatedAt",
    label: "Cập nhật",
    sortable: true,
    render: (wallet: WalletWithUser) => formatDate(wallet.updatedAt),
  },
];
