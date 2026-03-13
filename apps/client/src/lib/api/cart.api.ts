import { api } from "./index";
import { Product } from "./products.api";

export interface CartItem {
  productId: number;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
  studentId?: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export const cartApi = {
  /**
   * Get current user's cart
   */
  get: () => api.get<Cart>("/cart"),

  /**
   * Add item to cart
   */
  addItem: (data: AddToCartRequest) => api.post<Cart>("/cart/items", data),

  /**
   * Update cart item quantity
   */
  updateItem: (productId: number, data: UpdateCartItemRequest) =>
    api.patch<Cart>(`/cart/items/${productId}`, data),

  /**
   * Remove item from cart
   */
  removeItem: (productId: number) =>
    api.delete<Cart>(`/cart/items/${productId}`),

  /**
   * Clear all items from cart
   */
  clear: () => api.delete<Cart>("/cart"),
};
