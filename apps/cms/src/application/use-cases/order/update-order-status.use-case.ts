import { OrderEntity } from "@/domain/entities/order.entity";
import { orderRepository } from "@/infrastructure/database/repositories/order.repository";

export class UpdateOrderStatusUseCase {
  async execute(id: number, status: string): Promise<OrderEntity> {
    return orderRepository.updateStatus(id, status);
  }
}

export const updateOrderStatusUseCase = new UpdateOrderStatusUseCase();
