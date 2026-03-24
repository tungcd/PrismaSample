import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi, CreateOrderRequest, OrderFilters } from "../api/orders.api";
import { toast } from "sonner";

/**
 * Get all orders
 */
export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => ordersApi.getAll(filters),
  });
}

/**
 * Get order by ID
 */
export function useOrder(id: number) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.getById(id),
    enabled: !!id && id > 0,
  });
}

/**
 * Get order tracking
 */
export function useOrderTracking(id: number) {
  return useQuery({
    queryKey: ["order-tracking", id],
    queryFn: () => ordersApi.getTracking(id),
    enabled: !!id && id > 0,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Create order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      toast.success("Đặt hàng thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể đặt hàng");
    },
  });
}

/**
 * Cancel order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ordersApi.cancel(id),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      toast.success("Đã hủy đơn hàng");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể hủy đơn hàng");
    },
  });
}

/**
 * Reorder
 */
export function useReorder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ordersApi.reorder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Đã thêm vào giỏ hàng");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể đặt lại");
    },
  });
}
