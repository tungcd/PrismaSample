import { OrderEntity } from "@/domain/entities/order.entity";
import { orderRepository } from "@/infrastructure/database/repositories/order.repository";
import type { CreateOrderDTO } from "@/domain/repositories/order.repository.interface";

export class CreateOrderUseCase {
  async execute(data: CreateOrderDTO): Promise<OrderEntity> {
    return orderRepository.create(data);
  }
}

export const createOrderUseCase = new CreateOrderUseCase();
