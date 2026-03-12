import { PrismaTopUpRepository } from "@/infrastructure/database/repositories/top-up.repository";
import { TopUpEntity } from "@/domain/entities/top-up.entity";
import { CreateTopUpDTO } from "@/domain/repositories/top-up.repository.interface";

export async function createTopUpUseCase(
  data: CreateTopUpDTO,
): Promise<TopUpEntity> {
  const repository = new PrismaTopUpRepository();
  return repository.create(data);
}
