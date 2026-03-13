import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { WalletService } from "./wallet.service";
import { QueryWalletTransactionsDto } from "./dto/query-wallet-transactions.dto";

@Controller("wallet")
@UseGuards(JwtAuthGuard, RolesGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get()
  async getWallet(@CurrentUser() user: any) {
    return this.walletService.getWallet(user.id);
  }

  @Get("transactions")
  async getTransactions(
    @CurrentUser() user: any,
    @Query() query: QueryWalletTransactionsDto,
  ) {
    return this.walletService.getTransactions(user.id, query);
  }
}
