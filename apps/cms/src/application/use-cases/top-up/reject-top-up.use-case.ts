import { PrismaTopUpRepository } from "@/infrastructure/database/repositories/top-up.repository";
import { TopUpEntity } from "@/domain/entities/top-up.entity";
import { RejectTopUpDTO } from "@/domain/repositories/top-up.repository.interface";

export async function rejectTopUpUseCase(
  id: number,
  data: RejectTopUpDTO,
): Promise<TopUpEntity> {
  const repository = new PrismaTopUpRepository();
  return repository.reject(id, data);
}
