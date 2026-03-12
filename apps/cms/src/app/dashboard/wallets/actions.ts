"use server";

import { withRole } from "@/lib/with-auth";
import { getAllWalletsUseCase } from "@/application/use-cases/wallet/get-all-wallets.use-case";
import { toggleWalletLockUseCase } from "@/application/use-cases/wallet/toggle-wallet-lock.use-case";
import { FindWalletsParams } from "@/domain/repositories/wallet.repository.interface";

export const getAllWalletsAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, params: FindWalletsParams = {}) => {
    try {
      const result = await getAllWalletsUseCase.execute(params);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get wallets",
      };
    }
  },
);

export const toggleWalletLockAction = withRole(
  ["ADMIN"],
  async (authUser, id: number) => {
    try {
      const wallet = await toggleWalletLockUseCase.execute(id);
      return { success: true, data: wallet };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to toggle wallet lock",
      };
    }
  },
);
