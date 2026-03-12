import { IWalletRepository } from "@/domain/repositories/wallet.repository.interface";
import { walletRepository } from "@/infrastructure/database/repositories/wallet.repository";

export class GetAllWalletsUseCase {
  constructor(private walletRepository: IWalletRepository) {}

  async execute(params: any) {
    return this.walletRepository.findMany(params);
  }
}

export const getAllWalletsUseCase = new GetAllWalletsUseCase(walletRepository);
