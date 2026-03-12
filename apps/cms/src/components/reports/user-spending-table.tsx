"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSpendingEntity } from "@/domain/entities/report.entity";
import { Badge } from "@/components/ui/badge";

interface UserSpendingTableProps {
  users: UserSpendingEntity[];
}

export function UserSpendingTable({ users }: UserSpendingTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Chưa có";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Khách hàng chi tiêu nhiều nhất</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hạng</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead className="text-right">Tổng chi tiêu</TableHead>
              <TableHead className="text-right">Số đơn</TableHead>
              <TableHead className="text-right">Đơn gần nhất</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={user.userId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {index === 0 && <span className="text-2xl">🥇</span>}
                    {index === 1 && <span className="text-2xl">🥈</span>}
                    {index === 2 && <span className="text-2xl">🥉</span>}
                    {index > 2 && (
                      <span className="font-medium">{index + 1}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.userEmail}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.userType === "PARENT" ? "default" : "secondary"
                    }
                  >
                    {user.userType === "PARENT" ? "Phụ huynh" : "Học sinh"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(user.totalSpent)}
                </TableCell>
                <TableCell className="text-right">{user.orderCount}</TableCell>
                <TableCell className="text-right">
                  {formatDate(user.lastOrderDate)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
