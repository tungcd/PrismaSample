import { api } from "./index";
import { Product } from "./products.api";

export interface OrderItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  studentId?: number;
  student?: {
    id: number;
    name: string;
    grade: string;
  };
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  notes?: string;
  needsApproval: boolean;
  voucherCode?: string;
  voucher?: {
    id: number;
    code: string;
    description: string;
  };
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PREPARING = "PREPARING",
  READY = "READY",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export interface CreateOrderRequest {
  useCart?: boolean;
  items?: Array<{ productId: number; quantity: number }>;
  studentId?: number;
  notes?: string;
  voucherCode?: string;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  studentId?: number;
  fromDate?: string;
  toDate?: string;
}

export interface OrderTracking {
  orderId: number;
  orderNumber: string;
  status: OrderStatus;
  timeline: {
    status: string;
    timestamp: string;
    description?: string;
  }[];
}

export const ordersApi = {
  /**
   * Get all orders with filters
   */
  getAll: (filters?: OrderFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return api.get<{
      data: Order[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/orders?${params.toString()}`);
  },

  /**
   * Get order by ID
   */
  getById: (id: number) => api.get<Order>(`/orders/${id}`),

  /**
   * Create order from cart
   */
  create: (data: CreateOrderRequest) => api.post<Order>("/orders", data),

  /**
   * Cancel order
   */
  cancel: (id: number) => api.patch<Order>(`/orders/${id}/cancel`),

  /**
   * Get order tracking information
   */
  getTracking: (id: number) => api.get<OrderTracking>(`/orders/${id}/tracking`),

  /**
   * Reorder (add items to cart)
   */
  reorder: (id: number) => api.post(`/orders/${id}/reorder`),
};
