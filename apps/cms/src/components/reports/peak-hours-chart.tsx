"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PeakHoursEntity } from "@/domain/entities/report.entity";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PeakHoursChartProps {
  data: PeakHoursEntity[];
}

export function PeakHoursChart({ data }: PeakHoursChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Giờ cao điểm</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="hour"
              label={{ value: "Giờ", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={(value: number) => value.toString()}
              label={{ value: "Số đơn", angle: -90, position: "insideLeft" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={formatCurrency}
            />
            <Tooltip
              formatter={(value: any, name: any) => {
                if (name === "Doanh thu") return formatCurrency(value);
                return value;
              }}
              labelFormatter={(hour: any) => `Giờ ${hour}:00`}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="orderCount"
              fill="#8884d8"
              name="Số đơn"
            />
            <Bar
              yAxisId="right"
              dataKey="revenue"
              fill="#82ca9d"
              name="Doanh thu"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
