"use client";

import { useState, useEffect } from "react";
import { useWallet, useTransactions } from "@/lib/hooks/use-wallet";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { BalanceCard } from "./_components/balance-card";
import { SpendingLimits } from "./_components/spending-limits";
import { TransactionFilters } from "./_components/transaction-filters";
import { TransactionList } from "./_components/transaction-list";
import { TopUpDialog } from "@/components/dialogs/top-up-dialog";

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
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);

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

  const handleTopUp = () => {
    setShowTopUpDialog(true);
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

  const emptyMessage =
    typeFilter === "ALL"
      ? "Chưa có giao dịch nào"
      : `Không có giao dịch ${TYPE_FILTERS.find((f) => f.value === typeFilter)?.label.toLowerCase()}`;

  return (
    <div className="container max-w-2xl py-4 pb-20 space-y-4">
      <h1 className="text-2xl font-bold">Ví của tôi</h1>

      {/* Balance Card */}
      <BalanceCard
        balance={wallet?.balance || 0}
        lastTransactionDate={wallet?.lastTransaction?.createdAt}
        onTopUp={handleTopUp}
      />

      {/* Spending Limits (for students only) */}
      {mounted && user?.role === "STUDENT" && wallet?.spendingLimits && (
        <SpendingLimits
          dailyLimit={wallet.spendingLimits.dailyLimit}
          dailySpent={wallet.spendingLimits.dailySpent || 0}
          weeklyLimit={wallet.spendingLimits.weeklyLimit}
          weeklySpent={wallet.spendingLimits.weeklySpent || 0}
          monthlyLimit={wallet.spendingLimits.monthlyLimit}
          monthlySpent={wallet.spendingLimits.monthlySpent || 0}
          requiresApproval={wallet.spendingLimits.requiresApproval}
        />
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
          <TransactionFilters
            selectedType={typeFilter}
            onTypeChange={setTypeFilter}
          />
          <TransactionList
            transactions={transactions}
            isLoading={txLoading}
            emptyMessage={emptyMessage}
          />
        </CardContent>
      </Card>

      {/* Top Up Dialog */}
      <TopUpDialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog} />
    </div>
  );
}
