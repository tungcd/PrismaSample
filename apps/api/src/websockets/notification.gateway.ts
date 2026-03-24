import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Logger, UseGuards } from "@nestjs/common";
import { Socket } from "socket.io";
import { WsAuthGuard } from "./ws-auth.guard";
import { WebSocketsGateway } from "./websockets.gateway";

/**
 * Notification Gateway
 * Handles notification-specific WebSocket events
 */
@WebSocketGateway()
@UseGuards(WsAuthGuard)
export class NotificationGateway {
  private readonly logger = new Logger(NotificationGateway.name);

  constructor(private webSocketsGateway: WebSocketsGateway) {}

  /**
   * Client confirms notification was delivered
   * Update deliveryStatus to DELIVERED
   */
  @SubscribeMessage("notification:delivered")
  async handleNotificationDelivered(
    @MessageBody() data: { notificationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    this.logger.log(
      `Notification ${data.notificationId} delivered to user ${user.userId}`,
    );

    // Note: Actual DB update will be handled by NotificationService
    return {
      success: true,
      notificationId: data.notificationId,
    };
  }

  /**
   * Client marks notification as read
   * Update deliveryStatus to READ and set readAt timestamp
   */
  @SubscribeMessage("notification:read")
  async handleNotificationRead(
    @MessageBody() data: { notificationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    this.logger.log(
      `Notification ${data.notificationId} read by user ${user.userId}`,
    );

    // Note: Actual DB update will be handled by NotificationService
    return {
      success: true,
      notificationId: data.notificationId,
    };
  }

  /**
   * Client requests notification history
   */
  @SubscribeMessage("notification:list")
  async handleNotificationList(
    @MessageBody() data: { skip?: number; take?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    this.logger.log(`User ${user.userId} requested notification list`);

    // Note: Actual query will be handled by NotificationService
    return {
      success: true,
      message: "Use REST API GET /api/v1/notifications for full list",
    };
  }

  /**
   * Emit notification to specific user (called by NotificationService)
   */
  async emitNotificationToUser(userId: number, notification: any) {
    console.log('[NotificationGateway] emitNotificationToUser called:', {
      userId,
      notificationId: notification.id,
      title: notification.title,
    });

    const isOnline = this.webSocketsGateway.isUserOnline(userId);
    console.log('[NotificationGateway] User online status:', { userId, isOnline });

    if (isOnline) {
      console.log('[NotificationGateway] Emitting notification:new to user:', userId);
      this.webSocketsGateway.emitToUser(
        userId,
        "notification:new",
        notification,
      );
      console.log('[NotificationGateway] Notification emitted successfully');
      this.logger.log(
        `Notification ${notification.id} pushed to online user ${userId}`,
      );
      return true; // Delivered via socket
    } else {
      this.logger.log(
        `User ${userId} offline, notification ${notification.id} will be pending`,
      );
      return false; // User offline, keep as PENDING
    }
  }

  /**
   * Emit notification to all users with specific role
   */
  async emitNotificationToRole(role: string, notification: any) {
    this.webSocketsGateway.emitToRole(role, "notification:new", notification);
    this.logger.log(
      `Notification ${notification.id} broadcast to role: ${role}`,
    );
  }

  /**
   * Broadcast system announcement to all connected users
   */
  async broadcastSystemAnnouncement(notification: any) {
    this.webSocketsGateway.server.emit("notification:new", notification);
    this.logger.log(
      `System announcement ${notification.id} broadcast to all users`,
    );
  }
}
