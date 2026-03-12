import { PrismaTopUpRepository } from "@/infrastructure/repositories/top-up.repository";
import { TopUpEntity } from "@/domain/entities/top-up.entity";

export interface FindTopUpsParams {
  page?: number;
  pageSize?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "all";
  userId?: number;
  approvedBy?: number;
  startDate?: Date;
  endDate?: Date;
  sortBy?: "createdAt" | "amount" | "processedAt";
  sortOrder?: "asc" | "desc";
}

export interface GetTopUpsResult {
  data: TopUpEntity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getTopUpsUseCase(
  params: FindTopUpsParams = {},
): Promise<GetTopUpsResult> {
  const repository = new PrismaTopUpRepository();
  const { page = 1, pageSize = 10 } = params;

  const { topUps, total } = await repository.findMany(params);

  return {
    data: topUps,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
