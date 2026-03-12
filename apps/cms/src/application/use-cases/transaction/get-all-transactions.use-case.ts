import { ITransactionRepository } from "@/domain/repositories/transaction.repository.interface";
import { transactionRepository } from "@/infrastructure/database/repositories/transaction.repository";

export class GetAllTransactionsUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(params: any) {
    return this.transactionRepository.findMany(params);
  }
}

export const getAllTransactionsUseCase = new GetAllTransactionsUseCase(
  transactionRepository,
);
