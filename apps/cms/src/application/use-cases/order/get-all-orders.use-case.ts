import { OrderEntity } from "@/domain/entities/order.entity";
import { orderRepository } from "@/infrastructure/database/repositories/order.repository";

export class GetAllOrdersUseCase {
  async execute(): Promise<OrderEntity[]> {
    return orderRepository.findAll();
  }
}

export const getAllOrdersUseCase = new GetAllOrdersUseCase();
