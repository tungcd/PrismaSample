import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { VouchersService } from "./vouchers.service";
import { ValidateVoucherDto } from "./dto/validate-voucher.dto";

@Controller("vouchers")
@UseGuards(JwtAuthGuard, RolesGuard)
export class VouchersController {
  constructor(private vouchersService: VouchersService) {}

  @Get("available")
  async getAvailable() {
    return this.vouchersService.getAvailable();
  }

  @Post("validate")
  async validate(@Body() dto: ValidateVoucherDto) {
    return this.vouchersService.validateCode(dto.code, dto.amount ?? 0);
  }
}
