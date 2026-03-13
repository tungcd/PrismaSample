import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { QueryNotificationsDto } from "./dto/query-notifications.dto";

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number, query: QueryNotificationsDto) {
    const { page = 1, limit = 20, isRead, type } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, any> = { userId };
    if (isRead !== undefined) where.isRead = isRead;
    if (type) where.type = type;

    const [total, data] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markRead(id: number, userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });

    if (!result.count) {
      throw new NotFoundException("Không tìm thấy thông báo");
    }

    return { success: true };
  }

  async markAllRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { success: true, affected: result.count };
  }

  async remove(id: number, userId: number) {
    const result = await this.prisma.notification.deleteMany({
      where: { id, userId },
    });

    if (!result.count) {
      throw new NotFoundException("Không tìm thấy thông báo");
    }

    return { success: true };
  }
}
