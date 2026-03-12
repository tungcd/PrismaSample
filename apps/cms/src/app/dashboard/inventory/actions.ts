"use server";

import { withRole } from "@/lib/with-auth";
import { revalidatePath } from "next/cache";
import { InventoryType } from "@/domain/entities/inventory-transaction.entity";
import { getInventoryStatsUseCase } from "@/application/use-cases/inventory/get-inventory-stats.use-case";
import { getInventoryHistoryUseCase } from "@/application/use-cases/inventory/get-inventory-history.use-case";
import { createInventoryTransactionUseCase } from "@/application/use-cases/inventory/create-inventory-transaction.use-case";
import { FindInventoryTransactionsParams } from "@/domain/repositories/inventory-transaction.repository.interface";

// Get inventory stats for dashboard
export const getInventoryStatsAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser) => {
    try {
      const stats = await getInventoryStatsUseCase.execute();
      return stats;
    } catch (error) {
      console.error("Error getting inventory stats:", error);
      throw new Error("Failed to get inventory stats");
    }
  },
);

// Get inventory transaction history
export const getInventoryHistoryAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, params: FindInventoryTransactionsParams) => {
    try {
      const result = await getInventoryHistoryUseCase.execute(params);
      return result;
    } catch (error) {
      console.error("Error getting inventory history:", error);
      // Return empty result instead of throwing
      return {
        transactions: [],
        total: 0,
      };
    }
  },
);

// Create inventory transaction (adjust stock)
export const createInventoryTransactionAction = withRole(
  ["ADMIN", "MANAGER"],
  async (
    authUser,
    data: {
      productId: number;
      quantity: number;
      type: InventoryType;
      reason?: string;
    },
  ) => {
    try {
      console.log("Creating inventory transaction with authUser:", {
        id: authUser.id,
        email: authUser.email,
        role: authUser.role,
      });
      console.log("Transaction data:", data);

      const result = await createInventoryTransactionUseCase.execute({
        ...data,
        performedBy: authUser.id,
      });

      revalidatePath("/dashboard/inventory");
      revalidatePath("/dashboard/inventory/history");
      revalidatePath("/dashboard/products");

      return result;
    } catch (error: any) {
      console.error("Error creating inventory transaction:", error);
      throw new Error(
        error.message || "Failed to create inventory transaction",
      );
    }
  },
);
