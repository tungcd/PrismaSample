"use client";

import { useState, useEffect } from "react";
import { useWallet, useTransactions } from "@/lib/hooks/use-wallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertCircle,
  Plus,
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

const TYPE_FILTERS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Nạp tiền", value: "TOP_UP" },
  { label: "Mua hàng", value: "PURCHASE" },
  { label: "Hoàn tiền", value: "REFUND" },
  { label: "Điều chỉnh", value: "ADJUSTMENT" },
];

export default function WalletPage() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [typeFilter, setTypeFilter] = useState("ALL");

  const { data: wallet, isLoading: walletLoading } = useWallet();
  const filters = typeFilter === "ALL" ? {} : { type: typeFilter as any };
  const { data: txData, isLoading: txLoading } = useTransactions(filters);
  const transactions = txData?.data || [];

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

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

  const calculateProgress = (used: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (walletLoading) {
    return (
      <div className="container max-w-2xl py-4 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-4 pb-20 space-y-4">
      <h1 className="text-2xl font-bold">Ví của tôi</h1>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              <span className="text-sm opacity-90">Số dư khả dụng</span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="text-primary hover:text-primary"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nạp tiền
            </Button>
          </div>
          <p className="text-4xl font-bold mb-4">
            {formatCurrency(wallet?.balance || 0)}
          </p>
          {wallet?.lastTransaction && (
            <div className="text-sm opacity-80" suppressHydrationWarning>
              Giao dịch gần nhất:{" "}
              {formatDateTime(wallet.lastTransaction.createdAt).date}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spending Limits (for students) */}
      {mounted && user?.role === "STUDENT" && wallet?.spendingLimits && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Hạn mức chi tiêu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Daily Limit */}
            {wallet.spendingLimits.dailyLimit > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Hằng ngày</span>
                  <span className="font-medium">
                    {formatCurrency(wallet.spendingLimits.dailySpent || 0)} /{" "}
                    {formatCurrency(wallet.spendingLimits.dailyLimit)}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${getProgressColor(
                      calculateProgress(
                        wallet.spendingLimits.dailySpent || 0,
                        wallet.spendingLimits.dailyLimit,
                      ),
                    )}`}
                    style={{
                      width: `${calculateProgress(wallet.spendingLimits.dailySpent || 0, wallet.spendingLimits.dailyLimit)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Weekly Limit */}
            {wallet.spendingLimits.weeklyLimit > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Hằng tuần</span>
                  <span className="font-medium">
                    {formatCurrency(wallet.spendingLimits.weeklySpent || 0)} /{" "}
                    {formatCurrency(wallet.spendingLimits.weeklyLimit)}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${getProgressColor(
                      calculateProgress(
                        wallet.spendingLimits.weeklySpent || 0,
                        wallet.spendingLimits.weeklyLimit,
                      ),
                    )}`}
                    style={{
                      width: `${calculateProgress(wallet.spendingLimits.weeklySpent || 0, wallet.spendingLimits.weeklyLimit)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Monthly Limit */}
            {wallet.spendingLimits.monthlyLimit > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Hằng tháng</span>
                  <span className="font-medium">
                    {formatCurrency(wallet.spendingLimits.monthlySpent || 0)} /{" "}
                    {formatCurrency(wallet.spendingLimits.monthlyLimit)}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${getProgressColor(
                      calculateProgress(
                        wallet.spendingLimits.monthlySpent || 0,
                        wallet.spendingLimits.monthlyLimit,
                      ),
                    )}`}
                    style={{
                      width: `${calculateProgress(wallet.spendingLimits.monthlySpent || 0, wallet.spendingLimits.monthlyLimit)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {wallet.spendingLimits.requiresApproval && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  Các đơn hàng vượt hạn mức cần được phụ huynh duyệt
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Lịch sử giao dịch
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Type Filter */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b scrollbar-hide">
            {TYPE_FILTERS.map((filter) => (
              <Button
                key={filter.value}
                variant={typeFilter === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(filter.value)}
                className="whitespace-nowrap"
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Transactions List */}
          {txLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx: any) => {
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
                          tx.type === "PURCHASE"
                            ? "text-red-600"
                            : "text-green-600"
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
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-gray-600">
                {typeFilter === "ALL"
                  ? "Chưa có giao dịch nào"
                  : `Không có giao dịch ${TYPE_FILTERS.find((f) => f.value === typeFilter)?.label.toLowerCase()}`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
