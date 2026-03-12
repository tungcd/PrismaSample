import {
  IReportRepository,
  GetTopProductsParams,
} from "@/domain/repositories/report.repository.interface";
import { TopProductEntity } from "@/domain/entities/report.entity";
import { reportRepository } from "@/infrastructure/database/repositories/report.repository";

export class GetTopProductsUseCase {
  constructor(private reportRepository: IReportRepository) {}

  async execute(params: GetTopProductsParams): Promise<TopProductEntity[]> {
    return await this.reportRepository.getTopProducts(params);
  }
}

export const getTopProductsUseCase = new GetTopProductsUseCase(
  reportRepository,
);
