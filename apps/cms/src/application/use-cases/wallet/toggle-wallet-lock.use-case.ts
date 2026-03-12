import { IWalletRepository } from "@/domain/repositories/wallet.repository.interface";
import { walletRepository } from "@/infrastructure/database/repositories/wallet.repository";

export class ToggleWalletLockUseCase {
  constructor(private walletRepository: IWalletRepository) {}

  async execute(id: number) {
    return this.walletRepository.toggleLock(id);
  }
}

export const toggleWalletLockUseCase = new ToggleWalletLockUseCase(
  walletRepository,
);
