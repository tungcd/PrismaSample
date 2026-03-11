import { OrderEntity } from "../entities/order.entity";

export interface IOrderRepository {
  findAll(): Promise<OrderEntity[]>;
  findById(id: string): Promise<OrderEntity | null>;
  findRecent(limit: number): Promise<OrderEntity[]>;
  count(): Promise<number>;
  countByStatus(status: string): Promise<number>;
  calculateTotalRevenue(): Promise<number>;
}
