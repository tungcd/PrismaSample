export enum InventoryType {
  IN = "IN",
  OUT = "OUT",
  ADJUSTMENT = "ADJUSTMENT",
}

export interface InventoryTransactionEntity {
  id: number;
  productId: number;
  quantity: number;
  type: InventoryType;
  reason: string | null;
  performedBy: number;
  createdAt: Date;

  // Relations (optional)
  product?: {
    id: number;
    name: string;
    slug: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface InventoryStatsEntity {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStockValue: number;
  lowStockProducts: Array<{
    id: number;
    name: string;
    slug: string;
    stock: number;
    lowStockThreshold: number | null;
    price: number;
  }>;
}
