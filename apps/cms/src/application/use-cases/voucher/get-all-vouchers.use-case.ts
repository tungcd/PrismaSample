import {
  IVoucherRepository,
  FindVouchersParams,
} from "@/domain/repositories/voucher.repository.interface";
import { voucherRepository } from "@/infrastructure/database/repositories/voucher.repository";

export class GetAllVouchersUseCase {
  constructor(private voucherRepository: IVoucherRepository) {}

  async execute(params: FindVouchersParams) {
    return this.voucherRepository.findMany(params);
  }
}

export const getAllVouchersUseCase = new GetAllVouchersUseCase(
  voucherRepository,
);
