import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { QueryOrdersDto } from "./dto/query-orders.dto";
import { ApplyOrderVoucherDto } from "./dto/apply-order-voucher.dto";

@Controller("orders")
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async createOrder(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user.id, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: any, @Query() query: QueryOrdersDto) {
    return this.ordersService.findAll(user.id, user.role, query);
  }

  @Get(":id")
  async findOne(
    @CurrentUser() user: any,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.ordersService.findOne(id, user.id, user.role);
  }

  @Patch(":id/cancel")
  async cancelOrder(
    @CurrentUser() user: any,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.ordersService.cancelOrder(id, user.id, user.role);
  }

  @Get(":id/tracking")
  async getTracking(
    @CurrentUser() user: any,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.ordersService.getTracking(id, user.id, user.role);
  }

  @Post(":id/reorder")
  async reorder(
    @CurrentUser() user: any,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.ordersService.reorder(id, user.id, user.role);
  }

  @Post(":id/apply-voucher")
  async applyVoucher(
    @CurrentUser() user: any,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ApplyOrderVoucherDto,
  ) {
    return this.ordersService.applyVoucher(id, user.id, user.role, dto.code);
  }

  @Delete(":id/apply-voucher")
  async removeVoucher(
    @CurrentUser() user: any,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.ordersService.removeVoucher(id, user.id, user.role);
  }
}
