import {
  IVoucherRepository,
  UpdateVoucherDTO,
} from "@/domain/repositories/voucher.repository.interface";
import { voucherRepository } from "@/infrastructure/database/repositories/voucher.repository";

export class UpdateVoucherUseCase {
  constructor(private voucherRepository: IVoucherRepository) {}

  async execute(id: number, data: UpdateVoucherDTO) {
    return this.voucherRepository.update(id, data);
  }
}

export const updateVoucherUseCase = new UpdateVoucherUseCase(voucherRepository);
