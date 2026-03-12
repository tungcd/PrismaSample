import {
  IVoucherRepository,
  CreateVoucherDTO,
} from "@/domain/repositories/voucher.repository.interface";
import { voucherRepository } from "@/infrastructure/database/repositories/voucher.repository";

export class CreateVoucherUseCase {
  constructor(private voucherRepository: IVoucherRepository) {}

  async execute(data: CreateVoucherDTO) {
    return this.voucherRepository.create(data);
  }
}

export const createVoucherUseCase = new CreateVoucherUseCase(voucherRepository);
