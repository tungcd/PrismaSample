"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package2 } from "lucide-react";

interface LowStockProduct {
  id: number;
  name: string;
  slug: string;
  stock: number;
  lowStockThreshold: number | null;
  price: number;
}

interface LowStockTableProps {
  products: LowStockProduct[];
}

export function LowStockTable({ products }: LowStockTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (products.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center space-y-3 py-8">
          <Package2 className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            Không có sản phẩm nào sắp hết hàng
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Sản phẩm sắp hết hàng</h2>
            <p className="text-sm text-muted-foreground">
              Các sản phẩm có tồn kho thấp cần nhập thêm
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/inventory/history">Xem lịch sử</Link>
          </Button>
        </div>

        <div className="border rounded-lg">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Sản phẩm
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  Tồn kho
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  Ngưỡng cảnh báo
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  Giá
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      #{product.id}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-semibold ${
                        product.stock === 0
                          ? "text-red-600"
                          : product.stock <=
                              (product.lowStockThreshold || 0) / 2
                            ? "text-red-500"
                            : "text-yellow-600"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {product.lowStockThreshold || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {product.stock === 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Hết hàng
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Sắp hết
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
