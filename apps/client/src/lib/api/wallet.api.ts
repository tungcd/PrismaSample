import { api } from "./index";

export interface Wallet {
  id: number;
  userId: number;
  balance: number;
  isLocked: boolean;
  lastTransaction?: Transaction;
  spendingLimits?: {
    dailyLimit: number;
    dailySpent: number;
    weeklyLimit: number;
    weeklySpent: number;
    monthlyLimit: number;
    monthlySpent: number;
    requiresApproval: boolean;
  };
}

export interface Transaction {
  id: number;
  walletId: number;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  order?: {
    id: number;
    orderNumber: string;
  };
  createdAt: string;
}

export enum TransactionType {
  TOP_UP = "TOP_UP",
  PURCHASE = "PURCHASE",
  REFUND = "REFUND",
  ADJUSTMENT = "ADJUSTMENT",
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: TransactionType;
  fromDate?: string;
  toDate?: string;
}

export const walletApi = {
  /**
   * Get wallet balance
   */
  get: (studentId?: number) => {
    const params = studentId ? `?studentId=${studentId}` : "";
    return api.get<Wallet>(`/wallet${params}`);
  },

  /**
   * Get transaction history
   */
  getTransactions: (filters?: TransactionFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return api.get<{
      data: Transaction[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/wallet/transactions?${params.toString()}`);
  },
};
