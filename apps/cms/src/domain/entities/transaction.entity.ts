export enum TransactionType {
  TOP_UP = "TOP_UP",
  PURCHASE = "PURCHASE",
  REFUND = "REFUND",
  ADJUSTMENT = "ADJUSTMENT",
}

export interface TransactionEntity {
  id: number;
  walletId: number;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  metadata: any;
  createdAt: Date;
}
