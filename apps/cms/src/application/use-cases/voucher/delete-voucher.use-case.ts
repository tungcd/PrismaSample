import { IVoucherRepository } from "@/domain/repositories/voucher.repository.interface";
import { voucherRepository } from "@/infrastructure/database/repositories/voucher.repository";

export class DeleteVoucherUseCase {
  constructor(private voucherRepository: IVoucherRepository) {}

  async execute(id: number) {
    return this.voucherRepository.delete(id);
  }
}

export const deleteVoucherUseCase = new DeleteVoucherUseCase(voucherRepository);
