import { PrismaTopUpRepository } from "@/infrastructure/repositories/top-up.repository";
import { TopUpEntity } from "@/domain/entities/top-up.entity";
import { ApproveTopUpDTO } from "@/domain/repositories/top-up.repository.interface";

export async function approveTopUpUseCase(
  id: number,
  data: ApproveTopUpDTO,
): Promise<TopUpEntity> {
  const repository = new PrismaTopUpRepository();
  return repository.approve(id, data);
}
