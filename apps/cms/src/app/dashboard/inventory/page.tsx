import { getInventoryStatsAction } from "./actions";
import { InventoryStatsCards } from "./_components/inventory-stats-cards";
import { LowStockTable } from "./_components/low-stock-table";

export const revalidate = 120; // Cache for 2 minutes

export default async function InventoryPage() {
  try {
    const stats = await getInventoryStatsAction();

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý tồn kho</h1>
          <p className="text-muted-foreground">
            Theo dõi tồn kho và cảnh báo hàng sắp hết
          </p>
        </div>

        <InventoryStatsCards stats={stats} />

        <LowStockTable products={stats.lowStockProducts} />
      </div>
    );
  } catch (error) {
    console.error("Error loading inventory:", error);
    return (
      <div className="text-red-500">Có lỗi xảy ra khi tải dữ liệu tồn kho.</div>
    );
  }
}
