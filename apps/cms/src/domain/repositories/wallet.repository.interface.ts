import { WalletEntity } from "../entities/wallet.entity";

export interface FindWalletsParams {
  page?: number;
  pageSize?: number;
  userId?: number;
  isLocked?: boolean;
  minBalance?: number;
  maxBalance?: number;
  sortBy?: "balance" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface IWalletRepository {
  findMany(params: FindWalletsParams): Promise<{
    wallets: WalletEntity[];
    total: number;
  }>;
  findById(id: number): Promise<WalletEntity | null>;
  findByUserId(userId: number): Promise<WalletEntity | null>;
  toggleLock(id: number): Promise<WalletEntity>;
  count(): Promise<number>;
}
