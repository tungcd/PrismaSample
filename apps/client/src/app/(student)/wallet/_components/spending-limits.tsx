"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, AlertCircle } from "lucide-react";

interface SpendingLimitsProps {
  dailyLimit: number;
  dailySpent: number;
  weeklyLimit: number;
  weeklySpent: number;
  monthlyLimit: number;
  monthlySpent: number;
  requiresApproval: boolean;
}

export function SpendingLimits({
  dailyLimit,
  dailySpent,
  weeklyLimit,
  weeklySpent,
  monthlyLimit,
  monthlySpent,
  requiresApproval,
}: SpendingLimitsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Hạn mức chi tiêu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daily Limit */}
        {dailyLimit > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Hằng ngày</span>
              <span className="font-medium">
                {formatCurrency(dailySpent || 0)} / {formatCurrency(dailyLimit)}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${getProgressColor(
                  calculateProgress(dailySpent || 0, dailyLimit),
                )}`}
                style={{
                  width: `${calculateProgress(dailySpent || 0, dailyLimit)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Weekly Limit */}
        {weeklyLimit > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Hằng tuần</span>
              <span className="font-medium">
                {formatCurrency(weeklySpent || 0)} /{" "}
                {formatCurrency(weeklyLimit)}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${getProgressColor(
                  calculateProgress(weeklySpent || 0, weeklyLimit),
                )}`}
                style={{
                  width: `${calculateProgress(weeklySpent || 0, weeklyLimit)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Monthly Limit */}
        {monthlyLimit > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Hằng tháng</span>
              <span className="font-medium">
                {formatCurrency(monthlySpent || 0)} /{" "}
                {formatCurrency(monthlyLimit)}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${getProgressColor(
                  calculateProgress(monthlySpent || 0, monthlyLimit),
                )}`}
                style={{
                  width: `${calculateProgress(monthlySpent || 0, monthlyLimit)}%`,
                }}
              />
            </div>
          </div>
        )}

        {requiresApproval && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Các đơn hàng vượt quá hạn mức cần được phụ huynh duyệt
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
