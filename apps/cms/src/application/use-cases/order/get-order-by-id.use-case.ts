import { OrderEntity } from "@/domain/entities/order.entity";
import { orderRepository } from "@/infrastructure/database/repositories/order.repository";

export class GetOrderByIdUseCase {
  async execute(id: number): Promise<OrderEntity | null> {
    return orderRepository.findById(id);
  }
}

export const getOrderByIdUseCase = new GetOrderByIdUseCase();
