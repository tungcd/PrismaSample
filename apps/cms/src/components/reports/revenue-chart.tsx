"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RevenueStatsEntity } from "@/domain/entities/report.entity";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  initialData: RevenueStatsEntity;
  onPeriodChange: (period: "daily" | "weekly" | "monthly") => void;
}

export function RevenueChart({
  initialData,
  onPeriodChange,
}: RevenueChartProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">(
    initialData.period,
  );

  const handlePeriodChange = (value: "daily" | "weekly" | "monthly") => {
    setPeriod(value);
    onPeriodChange(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
    }).format(value);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Biểu đồ doanh thu</CardTitle>
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn kỳ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Theo ngày</SelectItem>
            <SelectItem value="weekly">Theo tuần</SelectItem>
            <SelectItem value="monthly">Theo tháng</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={initialData.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip
              formatter={(value: any) => formatCurrency(Number(value) || 0)}
              labelStyle={{ color: "#000" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              strokeWidth={2}
              name="Doanh thu"
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#82ca9d"
              strokeWidth={2}
              name="Số đơn"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
