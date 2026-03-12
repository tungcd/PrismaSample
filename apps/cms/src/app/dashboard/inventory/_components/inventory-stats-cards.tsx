"use client";

import { Card } from "@/components/ui/card";
import { Package, AlertTriangle, XCircle, DollarSign } from "lucide-react";
import { InventoryStatsEntity } from "@/domain/entities/inventory-transaction.entity";

interface InventoryStatsCardsProps {
  stats: InventoryStatsEntity;
}

export function InventoryStatsCards({ stats }: InventoryStatsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Tổng sản phẩm
            </p>
            <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Sắp hết hàng
            </p>
            <h3 className="text-2xl font-bold">{stats.lowStockCount}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-lg">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Hết hàng
            </p>
            <h3 className="text-2xl font-bold">{stats.outOfStockCount}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Giá trị tồn kho
            </p>
            <h3 className="text-2xl font-bold">
              {formatCurrency(stats.totalStockValue)}
            </h3>
          </div>
        </div>
      </Card>
    </div>
  );
}
