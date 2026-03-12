import { IVoucherRepository } from "@/domain/repositories/voucher.repository.interface";
import { voucherRepository } from "@/infrastructure/database/repositories/voucher.repository";

export class ToggleVoucherActiveUseCase {
  constructor(private voucherRepository: IVoucherRepository) {}

  async execute(id: number) {
    return this.voucherRepository.toggleActive(id);
  }
}

export const toggleVoucherActiveUseCase = new ToggleVoucherActiveUseCase(
  voucherRepository,
);
