import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cartApi,
  AddToCartRequest,
  UpdateCartItemRequest,
} from "../api/cart.api";
import { toast } from "sonner";

/**
 * Get current cart
 */
export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: () => cartApi.get(),
  });
}

/**
 * Add item to cart
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddToCartRequest) => cartApi.addItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Đã thêm vào giỏ hàng");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể thêm vào giỏ hàng");
    },
  });
}

/**
 * Update cart item quantity
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: number;
      data: UpdateCartItemRequest;
    }) => cartApi.updateItem(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể cập nhật giỏ hàng");
    },
  });
}

/**
 * Remove item from cart
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => cartApi.removeItem(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Đã xóa khỏi giỏ hàng");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể xóa");
    },
  });
}

/**
 * Clear cart
 */
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Đã xóa toàn bộ giỏ hàng");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể xóa giỏ hàng");
    },
  });
}
