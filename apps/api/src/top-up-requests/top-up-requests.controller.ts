import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { TopUpRequestsService } from "./top-up-requests.service";
import { CreateTopUpRequestDto } from "./dto/create-top-up-request.dto";

@Controller("top-up-requests")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TopUpRequestsController {
  constructor(private topUpRequestsService: TopUpRequestsService) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateTopUpRequestDto) {
    return this.topUpRequestsService.create(user.id, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.topUpRequestsService.findAll(user.id, user.role);
  }

  @Get(":id")
  async findOne(
    @CurrentUser() user: any,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.topUpRequestsService.findOne(id, user.id, user.role);
  }

  @Patch(":id/cancel")
  async cancel(@CurrentUser() user: any, @Param("id", ParseIntPipe) id: number) {
    return this.topUpRequestsService.cancel(id, user.id);
  }
}
