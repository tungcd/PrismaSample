import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationGateway } from "../websockets/notification.gateway";
import { QueryNotificationsDto } from "./dto/query-notifications.dto";
import {
  NotificationType,
  NotificationPriority,
  DeliveryStatus,
} from "@smart-canteen/prisma";

interface CreateNotificationInput {
  userId: number;
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  actionUrl?: string;
  metadata?: any;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {}

  /**
   * Create notification and push real-time if user is online
   */
  async create(input: CreateNotificationInput) {
    const {
      userId,
      title,
      message,
      type = NotificationType.INFO,
      priority = NotificationPriority.NORMAL,
      actionUrl,
      metadata,
    } = input;

    // Create notification in database
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        priority,
        actionUrl,
        metadata: metadata || {},
        deliveryStatus: DeliveryStatus.PENDING,
      },
    });

    this.logger.log(
      `Notification created: ID=${notification.id}, User=${userId}, Type=${type}, Priority=${priority}`,
    );

    // Try to push real-time via WebSocket
    const delivered = await this.notificationGateway.emitNotificationToUser(
      userId,
      {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        actionUrl: notification.actionUrl,
        metadata: notification.metadata,
        createdAt: notification.createdAt,
      },
    );

    // Update delivery status if pushed successfully
    if (delivered) {
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          deliveryStatus: DeliveryStatus.DELIVERED,
          deliveredAt: new Date(),
        },
      });

      this.logger.log(
        `Notification ${notification.id} delivered via Socket.IO`,
      );
    } else {
      this.logger.log(`Notification ${notification.id} queued (user offline)`);
    }

    return notification;
  }

  /**
   * Create notifications for multiple users
   */
  async createBulk(
    userIds: number[],
    input: Omit<CreateNotificationInput, "userId">,
  ) {
    const notifications = await Promise.all(
      userIds.map((userId) => this.create({ ...input, userId })),
    );

    this.logger.log(
      `Bulk notifications created: ${notifications.length} notifications`,
    );

    return notifications;
  }

  /**
   * Broadcast system announcement to all users with specific role
   */
  async broadcastToRole(
    role: string,
    input: Omit<CreateNotificationInput, "userId">,
  ) {
    // Get all users with this role
    const users = await this.prisma.user.findMany({
      where: { role: role as any, isActive: true },
      select: { id: true },
    });

    const userIds = users.map((u) => u.id);
    return this.createBulk(userIds, input);
  }

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
      data: {
        isRead: true,
        readAt: new Date(),
        deliveryStatus: DeliveryStatus.READ,
      },
    });

    if (!result.count) {
      throw new NotFoundException("Không tìm thấy thông báo");
    }

    this.logger.log(`Notification ${id} marked as read by user ${userId}`);
    return { success: true };
  }

  async markAllRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
        deliveryStatus: DeliveryStatus.READ,
      },
    });

    this.logger.log(
      `${result.count} notifications marked as read for user ${userId}`,
    );
    return { success: true, affected: result.count };
  }

  async remove(id: number, userId: number) {
    const result = await this.prisma.notification.deleteMany({
      where: { id, userId },
    });

    if (!result.count) {
      throw new NotFoundException("Không tìm thấy thông báo");
    }

    this.logger.log(`Notification ${id} deleted by user ${userId}`);
    return { success: true };
  }

  /**
   * Get unread notification count for user
   */
  async getUnreadCount(userId: number): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
