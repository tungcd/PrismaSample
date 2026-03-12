import { OrderEntity } from "@/domain/entities/order.entity";
import { orderRepository } from "@/infrastructure/database/repositories/order.repository";
import type { FindOrdersParams } from "@/domain/repositories/order.repository.interface";

export interface GetOrdersResult {
  orders: OrderEntity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class GetOrdersUseCase {
  async execute(params: FindOrdersParams = {}): Promise<GetOrdersResult> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const { orders, total } = await orderRepository.findMany(params);

    return {
      orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

export const getOrdersUseCase = new GetOrdersUseCase();
export type { FindOrdersParams };
