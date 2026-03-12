export interface WalletEntity {
  id: number;
  userId: number;
  balance: number;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
