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
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { NotificationsService } from "./notifications.service";
import { QueryNotificationsDto } from "./dto/query-notifications.dto";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { Role } from "@smart-canteen/prisma";

@Controller("notifications")
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  /**
   * Create notification - Internal endpoint for server-to-server calls
   * No auth required since it's called from CMS backend on internal Docker network
   */
  @Post()
  async create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create({
      userId: dto.userId,
      title: dto.title,
      message: dto.message,
      type: dto.type,
      priority: dto.priority,
      metadata: dto.metadata,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query() query: QueryNotificationsDto,
  ) {
    return this.notificationsService.findAll(user.id, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("unread-count")
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(":id/read")
  async markRead(
    @CurrentUser() user: any,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.notificationsService.markRead(id, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch("read-all")
  async markAllRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllRead(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(":id")
  async remove(
    @CurrentUser() user: any,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.notificationsService.remove(id, user.id);
  }
}
