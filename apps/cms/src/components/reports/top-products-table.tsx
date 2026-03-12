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
import { Button } from "@/components/ui/button";
import { TopProductEntity } from "@/domain/entities/report.entity";
import Image from "next/image";
import { ArrowUpDown } from "lucide-react";

interface TopProductsTableProps {
  products: TopProductEntity[];
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  const [sortBy, setSortBy] = useState<"revenue" | "quantity">("revenue");
  const [sortedProducts, setSortedProducts] = useState(products);

  const handleSort = (type: "revenue" | "quantity") => {
    setSortBy(type);
    const sorted = [...sortedProducts].sort((a, b) => {
      if (type === "revenue") {
        return b.totalRevenue - a.totalRevenue;
      }
      return b.totalQuantity - a.totalQuantity;
    });
    setSortedProducts(sorted);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sản phẩm bán chạy</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("quantity")}
                  className="font-semibold"
                >
                  Số lượng <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("revenue")}
                  className="font-semibold"
                >
                  Doanh thu <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Đơn hàng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.map((product, index) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.image && (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.slug}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {product.totalQuantity}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(product.totalRevenue)}
                </TableCell>
                <TableCell className="text-right">
                  {product.orderCount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
