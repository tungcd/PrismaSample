import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
}
