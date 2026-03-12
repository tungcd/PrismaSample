import { OrderEntity } from "../entities/order.entity";

export interface FindOrdersParams {
  page?: number;
  pageSize?: number;
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
  userId?: number;
  studentId?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: "createdAt" | "total" | "orderNumber";
  sortOrder?: "asc" | "desc";
}

export interface CreateOrderDTO {
  userId: number;
  studentId?: number;
  paymentMethod: string;
  notes?: string;
  items: {
    productId: number;
    quantity: number;
    price: number;
  }[];
}

export interface UpdateOrderDTO {
  status?: string;
  paymentStatus?: string;
  notes?: string;
}

export interface IOrderRepository {
  findMany(params: FindOrdersParams): Promise<{
    orders: OrderEntity[];
    total: number;
  }>;
  findAll(): Promise<OrderEntity[]>;
  findById(id: number): Promise<OrderEntity | null>;
  findRecent(limit: number): Promise<OrderEntity[]>;
  count(): Promise<number>;
  countByStatus(status: string): Promise<number>;
  calculateTotalRevenue(): Promise<number>;
  create(data: CreateOrderDTO): Promise<OrderEntity>;
  updateStatus(id: number, status: string): Promise<OrderEntity>;
  updatePaymentStatus(id: number, paymentStatus: string): Promise<OrderEntity>;
  delete(id: number): Promise<void>;
}
