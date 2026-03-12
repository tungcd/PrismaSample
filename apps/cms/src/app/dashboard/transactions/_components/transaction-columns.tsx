import { DataTableColumn } from "@/types/data-table.types";
import { Badge } from "@/components/ui/badge";
import { TransactionType } from "@/domain/entities/transaction.entity";
import { formatDate, formatTime } from "@/lib/format-date";

interface TransactionWithUser {
  id: number;
  walletId: number;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  metadata: any;
  createdAt: Date;
  wallet: {
    id: number;
    userId: number;
    user: {
      id: number;
      name: string;
      email: string;
    };
  };
}

const transactionTypeLabels: Record<TransactionType, string> = {
  TOP_UP: "Nạp tiền",
  PURCHASE: "Mua hàng",
  REFUND: "Hoàn tiền",
  ADJUSTMENT: "Điều chỉnh",
};

const transactionTypeVariants: Record<
  TransactionType,
  "default" | "secondary" | "destructive" | "outline"
> = {
  TOP_UP: "default",
  PURCHASE: "destructive",
  REFUND: "secondary",
  ADJUSTMENT: "outline",
};

export const transactionColumns: DataTableColumn<TransactionWithUser>[] = [
  {
    key: "id",
    label: "ID",
    sortable: false,
    render: (transaction: TransactionWithUser) => (
      <span className="font-mono">{transaction.id}</span>
    ),
  },
  {
    key: "user",
    label: "Người dùng",
    render: (transaction: TransactionWithUser) => (
      <div>
        <div className="font-medium">{transaction.wallet.user.name}</div>
        <div className="text-sm text-muted-foreground">
          {transaction.wallet.user.email}
        </div>
      </div>
    ),
  },
  {
    key: "type",
    label: "Loại giao dịch",
    filterable: false,
    render: (transaction: TransactionWithUser) => (
      <Badge variant={transactionTypeVariants[transaction.type]}>
        {transactionTypeLabels[transaction.type]}
      </Badge>
    ),
  },
  {
    key: "amount",
    label: "Số tiền",
    sortable: true,
    render: (transaction: TransactionWithUser) => {
      const isPositive =
        transaction.type === TransactionType.TOP_UP ||
        transaction.type === TransactionType.REFUND;
      return (
        <span className={isPositive ? "text-green-600" : "text-red-600"}>
          {isPositive ? "+" : "-"}
          {new Intl.NumberFormat("vi-VN").format(Number(transaction.amount))}₫
        </span>
      );
    },
  },
  {
    key: "balanceBefore",
    label: "Số dư trước",
    render: (transaction: TransactionWithUser) => (
      <span className="text-muted-foreground">
        {new Intl.NumberFormat("vi-VN").format(
          Number(transaction.balanceBefore),
        )}
        ₫
      </span>
    ),
  },
  {
    key: "balanceAfter",
    label: "Số dư sau",
    render: (transaction: TransactionWithUser) => (
      <span className="font-medium">
        {new Intl.NumberFormat("vi-VN").format(
          Number(transaction.balanceAfter),
        )}
        ₫
      </span>
    ),
  },
  {
    key: "description",
    label: "Mô tả",
    render: (transaction: TransactionWithUser) =>
      transaction.description || (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    key: "createdAt",
    label: "Thời gian",
    sortable: true,
    render: (transaction: TransactionWithUser) => {
      return (
        <div>
          <div>{formatDate(transaction.createdAt)}</div>
          <div className="text-sm text-muted-foreground">
            {formatTime(transaction.createdAt)}
          </div>
        </div>
      );
    },
  },
];
