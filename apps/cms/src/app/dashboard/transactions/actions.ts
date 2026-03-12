"use server";

import { withRole } from "@/lib/with-auth";
import { getAllTransactionsUseCase } from "@/application/use-cases/transaction/get-all-transactions.use-case";
import { FindTransactionsParams } from "@/domain/repositories/transaction.repository.interface";

export const getAllTransactionsAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, params: FindTransactionsParams = {}) => {
    try {
      const result = await getAllTransactionsUseCase.execute(params);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get transactions",
      };
    }
  },
);
