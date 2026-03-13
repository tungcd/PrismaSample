"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus } from "lucide-react";

interface BalanceCardProps {
  balance: number;
  lastTransactionDate?: string;
  onTopUp?: () => void;
}

export function BalanceCard({
  balance,
  lastTransactionDate,
  onTopUp,
}: BalanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
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
            onClick={onTopUp}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nạp tiền
          </Button>
        </div>
        <p className="text-4xl font-bold mb-4">{formatCurrency(balance)}</p>
        {lastTransactionDate && (
          <div className="text-sm opacity-80" suppressHydrationWarning>
            Giao dịch gần nhất: {formatDate(lastTransactionDate)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
