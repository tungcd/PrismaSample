import { useQuery } from "@tanstack/react-query";
import { walletApi, TransactionFilters } from "../api/wallet.api";

/**
 * Get wallet balance
 */
export function useWallet(studentId?: number) {
  return useQuery({
    queryKey: ["wallet", studentId],
    queryFn: () => walletApi.get(studentId),
  });
}

/**
 * Get transaction history
 */
export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => walletApi.getTransactions(filters),
  });
}
