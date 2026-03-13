"use client";

import {
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  DollarSign,
  Calendar,
} from "lucide-react";

const TRANSACTION_TYPE_CONFIG = {
  TOP_UP: {
    label: "Nạp tiền",
    color: "bg-green-100 text-green-800",
    icon: ArrowUpCircle,
    sign: "+",
  },
  PURCHASE: {
    label: "Mua hàng",
    color: "bg-red-100 text-red-800",
    icon: ArrowDownCircle,
    sign: "-",
  },
  REFUND: {
    label: "Hoàn tiền",
    color: "bg-blue-100 text-blue-800",
    icon: RefreshCw,
    sign: "+",
  },
  ADJUSTMENT: {
    label: "Điều chỉnh",
    color: "bg-gray-100 text-gray-800",
    icon: DollarSign,
    sign: "",
  },
};

interface Transaction {
  id: string | number;
  type: "TOP_UP" | "PURCHASE" | "REFUND" | "ADJUSTMENT";
  amount: number;
  description?: string;
  createdAt: string;
  order?: { id: string | number };
}

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  emptyMessage?: string;
}

export function TransactionList({
  transactions,
  isLoading,
  emptyMessage = "Chưa có giao dịch nào",
}: TransactionListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date),
      time: new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date),
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Calendar className="h-12 w-12 text-gray-300 mb-2" />
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const config =
          TRANSACTION_TYPE_CONFIG[
            tx.type as keyof typeof TRANSACTION_TYPE_CONFIG
          ];
        const Icon = config.icon;
        const dt = formatDateTime(tx.createdAt);

        return (
          <div
            key={tx.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div
              className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center flex-shrink-0`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{config.label}</p>
              <p className="text-sm text-gray-600 line-clamp-1">
                {tx.description || "Không có mô tả"}
              </p>
              <p
                className="text-xs text-gray-400 mt-0.5"
                suppressHydrationWarning
              >
                {dt.date} • {dt.time}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`font-bold ${
                  tx.type === "PURCHASE" ? "text-red-600" : "text-green-600"
                }`}
              >
                {config.sign}
                {formatCurrency(Math.abs(tx.amount))}
              </p>
              {tx.order && (
                <p className="text-xs text-gray-500">
                  #{String(tx.order.id).padStart(8, "0")}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
