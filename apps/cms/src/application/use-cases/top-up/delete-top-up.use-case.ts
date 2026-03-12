import { PrismaTopUpRepository } from "@/infrastructure/repositories/top-up.repository";

export async function deleteTopUpUseCase(id: number): Promise<void> {
  const repository = new PrismaTopUpRepository();
  return repository.delete(id);
}
