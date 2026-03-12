import {
  IReportRepository,
  GetUserSpendingParams,
} from "@/domain/repositories/report.repository.interface";
import { UserSpendingEntity } from "@/domain/entities/report.entity";
import { reportRepository } from "@/infrastructure/database/repositories/report.repository";

export class GetUserSpendingUseCase {
  constructor(private reportRepository: IReportRepository) {}

  async execute(params: GetUserSpendingParams): Promise<UserSpendingEntity[]> {
    return await this.reportRepository.getUserSpending(params);
  }
}

export const getUserSpendingUseCase = new GetUserSpendingUseCase(
  reportRepository,
);
