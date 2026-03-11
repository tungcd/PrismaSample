import { ProductEntity } from "../entities/product.entity";

export interface IProductRepository {
  findAll(): Promise<ProductEntity[]>;
  findById(id: string): Promise<ProductEntity | null>;
  count(): Promise<number>;
}
