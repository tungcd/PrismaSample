import { orderRepository } from "@/infrastructure/database/repositories/order.repository";

export class DeleteOrderUseCase {
  async execute(id: number): Promise<void> {
    return orderRepository.delete(id);
  }
}

export const deleteOrderUseCase = new DeleteOrderUseCase();
