import { PrismaTopUpRepository } from "@/infrastructure/repositories/top-up.repository";
import { TopUpEntity } from "@/domain/entities/top-up.entity";

export async function getTopUpByIdUseCase(
  id: number,
): Promise<TopUpEntity | null> {
  const repository = new PrismaTopUpRepository();
  return repository.findById(id);
}
