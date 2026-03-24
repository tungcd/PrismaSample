import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../websockets/ws-auth.guard';
import { WebSocketsGateway } from '../websockets/websockets.gateway';
import { ChatService } from './chat.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, NotificationPriority } from '@smart-canteen/prisma';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  user?: any;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})
@UseGuards(WsAuthGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track user's active rooms: socketId -> Set of roomIds
  private userRooms = new Map<string, Set<number>>();

  // Track typing indicators: roomId -> Set of userIds
  private typingIndicators = new Map<number, Set<number>>();

  constructor(
    private chatService: ChatService,
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
    private webSocketsGateway: WebSocketsGateway,
  ) {}

  // ============================================
  // CONNECTION HANDLING
  // ============================================

  async handleConnection(client: AuthenticatedSocket) {
    // User already authenticated by WsAuthGuard in WebSocketsGateway
    // Set userId for backward compatibility
    try {
      const userId = client.data?.user?.userId;
      if (!userId) {
        console.error('[ChatGateway] No userId in client.data');
        return;
      }

      // Set for backward compatibility with existing code
      client.userId = userId;
      client.user = client.data.user;

      // Get user's rooms and join them
      const rooms = await this.chatService.getUserRooms(userId);
      const roomIds = new Set<number>();
      
      for (const room of rooms) {
        await client.join(`room:${room.id}`);
        roomIds.add(room.id);
      }
      
      this.userRooms.set(client.id, roomIds);

      console.log('[ChatGateway] User joined rooms:', {
        socketId: client.id,
        userId,
        roomCount: roomIds.size,
      });
    } catch (error) {
      console.error('[ChatGateway] Connection error:', error);
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.userId || client.data?.user?.userId;
    if (!userId) return;

    // Remove from typing indicators
    this.typingIndicators.forEach((users, roomId) => {
      if (users.has(userId)) {
        users.delete(userId);
        this.server.to(`room:${roomId}`).emit('typing:stopped', {
          roomId,
          userId,
        });
      }
    });

    // Clean up room tracking
    this.userRooms.delete(client.id);
  }

  // ============================================
  // ROOM EVENTS
  // ============================================

  @SubscribeMessage('room:join')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: number },
  ) {
    try {
      // Verify user is a member
      const room = await this.chatService.getRoomById(data.roomId, client.userId!);
      
      // Join socket room
      client.join(`room:${data.roomId}`);

      // Track room
      if (!this.userRooms.has(client.id)) {
        this.userRooms.set(client.id, new Set());
      }
      this.userRooms.get(client.id)!.add(data.roomId);

      // Notify others
      client.to(`room:${data.roomId}`).emit('member:online', {
        roomId: data.roomId,
        userId: client.userId,
        timestamp: new Date(),
      });

      return { success: true, room };
    } catch (error) {
      console.error('[ChatGateway] Error in room:join', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('room:leave')
  handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: number },
  ) {
    client.leave(`room:${data.roomId}`);
    
    // Remove from tracking
    const rooms = this.userRooms.get(client.id);
    if (rooms) {
      rooms.delete(data.roomId);
    }

    return { success: true };
  }

  // ============================================
  // MESSAGE EVENTS
  // ============================================

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: number; content: string; replyToId?: number; metadata?: any },
  ) {
    try {
      // Save message via service
      const message = await this.chatService.sendMessage(data.roomId, client.userId!, {
        content: data.content,
        replyToId: data.replyToId,
        metadata: data.metadata,
      });

      // Broadcast to room (including sender for confirmation)
      this.server.to(`room:${data.roomId}`).emit('message:new', {
        roomId: data.roomId,
        message,
      });

      // Send notifications to room members (except sender)
      try {
        console.log('[ChatGateway] Fetching room for notifications, roomId:', data.roomId);
        const room = await this.prisma.room.findUnique({
          where: { id: data.roomId },
          select: {
            name: true,
            type: true,
            members: {
              select: {
                userId: true,
                user: {
                  select: { name: true },
                },
              },
            },
          },
        });

        console.log('[ChatGateway] Room fetched:', room ? `${room.type} with ${room.members.length} members` : 'null');

        if (room) {
          const sender = room.members.find(m => m.userId === client.userId!);
          const senderName = sender?.user.name || 'Someone';
          const messagePreview = message.content.length > 50 
            ? message.content.substring(0, 50) + '...' 
            : message.content;

          // Create notifications for all members except sender
          const recipientIds = room.members
            .map(m => m.userId)
            .filter(userId => userId !== client.userId);

          console.log('[ChatGateway] Creating notifications for recipients:', recipientIds);

          for (const recipientId of recipientIds) {
            console.log('[ChatGateway] Creating notification for user:', recipientId);
            await this.notificationsService.create({
              userId: recipientId,
              title: room.type === 'DIRECT' ? `Tin nhắn từ ${senderName}` : `Tin nhắn mới trong ${room.name || 'nhóm'}`,
              message: `${senderName}: ${messagePreview}`,
              type: NotificationType.INFO,
              priority: NotificationPriority.NORMAL,
              actionUrl: `/chat/${data.roomId}`,
              metadata: {
                roomId: data.roomId,
                messageId: message.id,
                senderId: client.userId,
                senderName,
              },
            });
            console.log('[ChatGateway] Notification created for user:', recipientId);
          }
        }
      } catch (notifError) {
        console.error('[ChatGateway] Failed to send notifications:', notifError);
        // Don't fail the message send if notification fails
      }

      return { success: true, message };
    } catch (error) {
      console.error('[ChatGateway] Error in message:send', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('message:edit')
  async handleEditMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: number; content: string },
  ) {
    try {
      const message = await this.chatService.editMessage(data.messageId, client.userId!, {
        content: data.content,
      });

      // Get roomId from message
      const fullMessage = await this.prisma.chatMessage.findUnique({
        where: { id: data.messageId },
        select: { roomId: true },
      });

      // Broadcast update
      this.server.to(`room:${fullMessage!.roomId}`).emit('message:edited', {
        roomId: fullMessage!.roomId,
        message,
      });

      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('message:delete')
  async handleDeleteMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: number; forEveryone: boolean },
  ) {
    try {
      // Get roomId before delete
      const fullMessage = await this.prisma.chatMessage.findUnique({
        where: { id: data.messageId },
        select: { roomId: true },
      });

      await this.chatService.deleteMessage(data.messageId, client.userId!, data.forEveryone);

      // Broadcast deletion
      this.server.to(`room:${fullMessage!.roomId}`).emit('message:deleted', {
        roomId: fullMessage!.roomId,
        messageId: data.messageId,
        forEveryone: data.forEveryone,
        userId: client.userId,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // REACTION EVENTS
  // ============================================

  @SubscribeMessage('reaction:add')
  async handleAddReaction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: number; emoji: string },
  ) {
    try {
      // Get roomId first
      const message = await this.prisma.chatMessage.findUnique({
        where: { id: data.messageId },
        select: { roomId: true },
      });

      if (!message) {
        return { success: false, error: 'Message not found' };
      }

      // Get existing reactions from this user before adding new one
      const existingReactions = await this.prisma.messageReaction.findMany({
        where: {
          messageId: data.messageId,
          userId: client.userId!,
        },
      });

      // Add reaction (this will remove old reactions and add new one)
      const reaction = await this.chatService.addReaction(data.messageId, client.userId!, data.emoji);

      // Broadcast removal of old reactions if any existed
      if (existingReactions.length > 0) {
        for (const oldReaction of existingReactions) {
          this.server.to(`room:${message.roomId}`).emit('reaction:removed', {
            roomId: message.roomId,
            messageId: data.messageId,
            userId: client.userId,
            emoji: oldReaction.emoji,
          });
        }
      }

      // Broadcast new reaction
      this.server.to(`room:${message.roomId}`).emit('reaction:added', {
        roomId: message.roomId,
        messageId: data.messageId,
        reaction,
      });

      return { success: true, reaction };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('reaction:remove')
  async handleRemoveReaction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: number; emoji: string },
  ) {
    try {
      // Get roomId first
      const message = await this.prisma.chatMessage.findUnique({
        where: { id: data.messageId },
        select: { roomId: true },
      });

      await this.chatService.removeReaction(data.messageId, client.userId!, data.emoji);

      // Broadcast
      this.server.to(`room:${message!.roomId}`).emit('reaction:removed', {
        roomId: message!.roomId,
        messageId: data.messageId,
        userId: client.userId,
        emoji: data.emoji,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // TYPING INDICATORS
  // ============================================

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: number },
  ) {
    if (!this.typingIndicators.has(data.roomId)) {
      this.typingIndicators.set(data.roomId, new Set());
    }
    
    this.typingIndicators.get(data.roomId)!.add(client.userId!);

    // Broadcast to others in room
    client.to(`room:${data.roomId}`).emit('typing:started', {
      roomId: data.roomId,
      userId: client.userId,
      userName: client.user.name,
    });

    // Auto-stop after 10 seconds
    setTimeout(() => {
      this.handleTypingStop(client, data);
    }, 10000);

    return { success: true };
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: number },
  ) {
    const typingUsers = this.typingIndicators.get(data.roomId);
    if (typingUsers) {
      typingUsers.delete(client.userId!);
    }

    client.to(`room:${data.roomId}`).emit('typing:stopped', {
      roomId: data.roomId,
      userId: client.userId,
    });

    return { success: true };
  }

  // ============================================
  // READ RECEIPTS
  // ============================================

  @SubscribeMessage('message:read')
  async handleMessageRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: number; lastSeenMessageId?: number },
  ) {
    try {
      const result = await this.chatService.markAsRead(data.roomId, client.userId!, {
        lastSeenMessageId: data.lastSeenMessageId,
      });

      // Broadcast to room
      client.to(`room:${data.roomId}`).emit('message:read:update', {
        roomId: data.roomId,
        userId: client.userId,
        lastSeenMessageId: data.lastSeenMessageId,
        timestamp: new Date(),
      });

      return { ...result, success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Check if user is online (any device)
   */
  isUserOnline(userId: number): boolean {
    return this.webSocketsGateway.isUserOnline(userId);
  }

  /**
   * Emit event to specific user (all their devices)
   */
  emitToUser(userId: number, event: string, data: any) {
    this.webSocketsGateway.emitToUser(userId, event, data);
  }

  /**
   * Emit event to room
   */
  emitToRoom(roomId: number, event: string, data: any) {
    this.server.to(`room:${roomId}`).emit(event, data);
  }
}
