import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { S3Service } from "../infrastructure/s3.service";
import {
  CreateRoomDto,
  SendMessageDto,
  UpdateRoomDto,
  AddMemberDto,
  UpdateMemberRoleDto,
  EditMessageDto,
  MarkAsReadDto,
} from "./dto";
import {
  RoomType,
  MemberRole,
  MessageStatus,
  MessageContentType,
} from "@smart-canteen/prisma";

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  // ============================================
  // ROOM MANAGEMENT
  // ============================================

  /**
   * Create a new room (DIRECT or GROUP)
   * Phase 1: Only DIRECT chat supported
   */
  async createRoom(userId: number, dto: CreateRoomDto) {
    const { type, name, avatar, memberIds } = dto;

    // DIRECT chat must have exactly 2 members (creator + 1 other)
    if (type === "DIRECT" && memberIds.length !== 1) {
      throw new BadRequestException(
        "DIRECT chat must have exactly 1 other member",
      );
    }

    // GROUP chat must have at least 3 members total (creator + 2 others)
    if (type === "GROUP" && memberIds.length < 2) {
      throw new BadRequestException(
        "GROUP chat must have at least 2 other members",
      );
    }

    // Check if DIRECT room already exists between these 2 users
    if (type === "DIRECT") {
      const otherUserId = memberIds[0];
      const existingRoom = await this.findDirectRoom(userId, otherUserId);
      if (existingRoom) {
        return existingRoom; // Return existing room instead of creating new
      }
    }

    // Create room
    const room = await this.prisma.room.create({
      data: {
        type,
        name: type === "GROUP" ? name : null,
        avatar: type === "GROUP" ? avatar : null,
        createdBy: userId,
        isActive: true,
        members: {
          create: [
            // Creator
            {
              userId,
              role: (type === "GROUP" ? "OWNER" : "MEMBER") as MemberRole,
            },
            // Other members
            ...memberIds.map((memberId) => ({
              userId: memberId,
              role: "MEMBER" as MemberRole,
            })),
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return room;
  }

  /**
   * Find existing DIRECT room between 2 users
   */
  async findDirectRoom(userId1: number, userId2: number) {
    const rooms = await this.prisma.room.findMany({
      where: {
        type: RoomType.DIRECT,
        isActive: true,
        members: {
          every: {
            userId: {
              in: [userId1, userId2],
            },
            leftAt: null,
          },
        },
      },
      include: {
        members: {
          where: {
            leftAt: null,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    // Filter to exact 2 members
    const directRoom = rooms.find((room) => room.members.length === 2);

    return directRoom || null;
  }

  /**
   * Get all rooms for a user
   */
  async getUserRooms(userId: number, skip = 0, take = 20) {
    // Get user role for permission check
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isSupport = ["ADMIN", "MANAGER", "STAFF"].includes(user?.role || "");

    // Support staff can see ALL rooms, regular users only see their own
    const rooms = await this.prisma.room.findMany({
      where: {
        isActive: true,
        // Support staff: no member filter, Regular users: must be member
        ...(!isSupport && {
          members: {
            some: {
              userId,
              leftAt: null,
            },
          },
        }),
      },
      include: {
        members: {
          where: {
            leftAt: null,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
      skip,
      take,
    });

    // Get unread count for each room
    const roomsWithUnread = await Promise.all(
      rooms.map(async (room) => {
        const member = room.members.find((m) => m.userId === userId);
        return {
          ...room,
          unreadCount: member?.unreadCount || 0,
          isPinned: member?.isPinned || false,
          isMuted: member?.isMuted || false,
          lastSeenAt: member?.lastSeenAt,
        };
      }),
    );

    return roomsWithUnread;
  }

  /**
   * Get room by ID
   */
  async getRoomById(roomId: number, userId: number) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: {
          where: {
            leftAt: null,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException("Room not found");
    }

    // Get user role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isSupport = ["ADMIN", "MANAGER", "STAFF"].includes(user?.role || "");

    // Check if user is a member (support staff can access all rooms)
    const member = room.members.find((m) => m.userId === userId);
    if (!member && !isSupport) {
      throw new ForbiddenException("You are not a member of this room");
    }

    return {
      ...room,
      unreadCount: member?.unreadCount || 0,
      isPinned: member?.isPinned || false,
      isMuted: member?.isMuted || false,
      lastSeenAt: member?.lastSeenAt || null,
      memberRole: member?.role || null,
    };
  }

  /**
   * Update room (name, avatar)
   */
  async updateRoom(roomId: number, userId: number, dto: UpdateRoomDto) {
    await this.checkMemberPermission(roomId, userId, [
      "OWNER" as MemberRole,
      "ADMIN" as MemberRole,
    ]);

    return this.prisma.room.update({
      where: { id: roomId },
      data: dto,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Delete/Archive room
   */
  async deleteRoom(roomId: number, userId: number) {
    await this.checkMemberPermission(roomId, userId, ["OWNER" as MemberRole]);

    return this.prisma.room.update({
      where: { id: roomId },
      data: { isActive: false },
    });
  }

  // ============================================
  // MEMBER MANAGEMENT
  // ============================================

  /**
   * Add member to room (GROUP only)
   */
  async addMember(roomId: number, userId: number, dto: AddMemberDto) {
    const room = await this.getRoomById(roomId, userId);

    if (room.type !== "GROUP") {
      throw new BadRequestException("Cannot add members to DIRECT chat");
    }

    await this.checkMemberPermission(roomId, userId, [
      "OWNER" as MemberRole,
      "ADMIN" as MemberRole,
    ]);

    // Check if member already exists
    const existingMember = await this.prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId: dto.userId,
        },
      },
    });

    if (existingMember && !existingMember.leftAt) {
      throw new BadRequestException("User is already a member");
    }

    // Add or rejoin member
    if (existingMember) {
      return this.prisma.roomMember.update({
        where: {
          roomId_userId: {
            roomId,
            userId: dto.userId,
          },
        },
        data: {
          leftAt: null,
          role: "MEMBER" as MemberRole,
        },
      });
    } else {
      return this.prisma.roomMember.create({
        data: {
          roomId,
          userId: dto.userId,
          role: "MEMBER" as MemberRole,
        },
      });
    }
  }

  /**
   * Remove member from room
   */
  async removeMember(roomId: number, userId: number, targetUserId: number) {
    await this.checkMemberPermission(roomId, userId, [
      "OWNER" as MemberRole,
      "ADMIN" as MemberRole,
    ]);

    return this.prisma.roomMember.update({
      where: {
        roomId_userId: {
          roomId,
          userId: targetUserId,
        },
      },
      data: {
        leftAt: new Date(),
      },
    });
  }

  /**
   * Leave room
   */
  async leaveRoom(roomId: number, userId: number) {
    const room = await this.getRoomById(roomId, userId);

    if (room.type === "DIRECT") {
      throw new BadRequestException(
        "Cannot leave DIRECT chat, use archive instead",
      );
    }

    return this.prisma.roomMember.update({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
      data: {
        leftAt: new Date(),
      },
    });
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    roomId: number,
    userId: number,
    dto: UpdateMemberRoleDto,
  ) {
    await this.checkMemberPermission(roomId, userId, ["OWNER" as MemberRole]);

    return this.prisma.roomMember.update({
      where: {
        roomId_userId: {
          roomId,
          userId: dto.userId,
        },
      },
      data: {
        role: dto.role,
      },
    });
  }

  // ============================================
  // MESSAGE MANAGEMENT
  // ============================================

  /**
   * Get messages in a room (paginated)
   */
  async getMessages(
    roomId: number,
    userId: number,
    before?: number,
    after?: number,
    limit = 50,
  ) {
    // Check membership
    await this.getRoomById(roomId, userId);

    // Build where clause WITHOUT deletedFor filter (will filter in application)
    const where: any = {
      roomId,
      deletedAt: null,
    };

    if (before) {
      where.id = { lt: before };
    } else if (after) {
      where.id = { gt: after };
    }

    // Query all messages (will filter deletedFor after)
    const allMessages = await this.prisma.chatMessage.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            contentType: true,
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        attachments: true,
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        reads: {
          where: {
            userId,
          },
          select: {
            readAt: true,
          },
        },
        _count: {
          select: {
            reads: true,
          },
        },
      },
      orderBy: {
        createdAt: before || after ? "desc" : "desc",
      },
      take: limit,
    });

    // Filter out messages deleted for this user
    // Force userId to number to ensure type consistency
    const userIdNum = Number(userId);
    const messages = allMessages.filter((msg) => {
      // Check if message is deleted for current user
      const isDeletedForUser =
        msg.deletedFor &&
        Array.isArray(msg.deletedFor) &&
        msg.deletedFor.length > 0;
      // Keep message only if NOT deleted for this user
      return !isDeletedForUser;
    });

    // Reverse if loading latest
    if (!before && !after) {
      messages.reverse();
    }

    const hasMore = messages.length === limit;
    const oldestMessageId = messages[0]?.id;
    const newestMessageId = messages[messages.length - 1]?.id;

    return {
      messages,
      hasMore,
      oldestMessageId,
      newestMessageId,
    };
  }

  /**
   * Send message
   */
  async sendMessage(roomId: number, userId: number, dto: SendMessageDto) {
    // Check membership
    const room = await this.getRoomById(roomId, userId);

    // Get user role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isSupport = ["ADMIN", "MANAGER", "STAFF"].includes(user?.role || "");

    // Find member (support staff can bypass this check)
    const member = room.members.find((m) => m.userId === userId);

    if (!member && !isSupport) {
      console.error(
        "[sendMessage] User is not a member and not support staff",
        { userId, roomId },
      );
      throw new ForbiddenException(
        "You must be a member of this room to send messages",
      );
    }

    // Check if user is muted (only if they are a member)
    if (member?.isMuted) {
      console.error("[sendMessage] User is muted", { userId, roomId });
      throw new ForbiddenException("You are muted in this room");
    }

    // Create message
    const message = await this.prisma.chatMessage.create({
      data: {
        roomId,
        senderId: userId,
        content: dto.content,
        contentType: dto.contentType || MessageContentType.TEXT,
        replyToId: dto.replyToId,
        status: MessageStatus.SENT,
        metadata: dto.metadata,
        attachments: dto.attachments
          ? {
              create: dto.attachments.map((att) => ({
                url: att.url,
                filename: att.fileName,
                mimeType: att.fileType,
                size: att.fileSize,
              })),
            }
          : undefined,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        attachments: true,
      },
    });

    // Update room lastMessage
    await this.prisma.room.update({
      where: { id: roomId },
      data: {
        lastMessageAt: message.createdAt,
        lastMessagePreview: message.content.substring(0, 100),
      },
    });

    // Increment unread count for other members
    await this.prisma.roomMember.updateMany({
      where: {
        roomId,
        userId: {
          not: userId,
        },
        leftAt: null,
      },
      data: {
        unreadCount: {
          increment: 1,
        },
      },
    });

    // Mark as read by sender
    await this.prisma.messageRead.create({
      data: {
        messageId: message.id,
        userId,
      },
    });

    return message;
  }

  /**
   * Edit message
   */
  async editMessage(messageId: number, userId: number, dto: EditMessageDto) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException("Message not found");
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException("You can only edit your own messages");
    }

    // Check if message is within 15 minutes
    const fifteenMinutes = 15 * 60 * 1000;
    if (Date.now() - message.createdAt.getTime() > fifteenMinutes) {
      throw new BadRequestException("Cannot edit message after 15 minutes");
    }

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        content: dto.content,
        editedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: number, userId: number, forEveryone = false) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException("Message not found");
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException("You can only delete your own messages");
    }

    if (forEveryone) {
      // Check if within 5 minutes
      const fiveMinutes = 5 * 60 * 1000;
      if (Date.now() - message.createdAt.getTime() > fiveMinutes) {
        throw new BadRequestException(
          "Cannot delete for everyone after 5 minutes",
        );
      }

      return this.prisma.chatMessage.update({
        where: { id: messageId },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      });
    } else {
      // Delete for me only
      return this.prisma.chatMessage.update({
        where: { id: messageId },
        data: {
          deletedFor: {
            push: userId,
          },
        },
      });
    }
  }

  /**
   * Add reaction to message
   * Note: When a user adds a new reaction, it replaces any existing reaction from that user
   */
  async addReaction(messageId: number, userId: number, emoji: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException("Message not found");
    }

    // Check membership
    await this.getRoomById(message.roomId, userId);

    // Remove any existing reactions from this user on this message
    await this.prisma.messageReaction.deleteMany({
      where: {
        messageId,
        userId,
      },
    });

    // Add the new reaction
    return this.prisma.messageReaction.create({
      data: {
        messageId,
        userId,
        emoji,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Remove reaction from message
   */
  async removeReaction(messageId: number, userId: number, emoji: string) {
    return this.prisma.messageReaction.delete({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji,
        },
      },
    });
  }

  /**
   * Mark messages as read
   */
  async markAsRead(roomId: number, userId: number, dto: MarkAsReadDto) {
    // Check membership
    await this.getRoomById(roomId, userId);

    // Get messages after lastSeenMessageId
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        roomId,
        id: {
          gt: dto.lastSeenMessageId || 0,
        },
        senderId: {
          not: userId, // Don't mark own messages
        },
      },
      select: {
        id: true,
      },
    });

    // Create read receipts
    const readReceipts = messages.map((msg) => ({
      messageId: msg.id,
      userId,
    }));

    if (readReceipts.length > 0) {
      await this.prisma.messageRead.createMany({
        data: readReceipts,
        skipDuplicates: true,
      });
    }

    // Update member's lastSeen
    await this.prisma.roomMember.update({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
      data: {
        lastSeenAt: new Date(),
        lastSeenMessageId: dto.lastSeenMessageId || null,
        unreadCount: 0,
      },
    });

    return { success: true, markedCount: readReceipts.length };
  }

  /**
   * Get who read a message
   */
  async getMessageReads(messageId: number, userId: number) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: { roomId: true },
    });

    if (!message) {
      throw new NotFoundException("Message not found");
    }

    // Check membership
    await this.getRoomById(message.roomId, userId);

    return this.prisma.messageRead.findMany({
      where: { messageId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        readAt: "asc",
      },
    });
  }

  /**
   * Search messages
   */
  async searchMessages(
    userId: number,
    query: string,
    roomId?: number,
    limit = 20,
  ) {
    const where: any = {
      content: {
        contains: query,
        mode: "insensitive",
      },
      deletedAt: null,
      deletedFor: {
        none: userId,
      },
      room: {
        members: {
          some: {
            userId,
            leftAt: null,
          },
        },
      },
    };

    if (roomId) {
      where.roomId = roomId;
    }

    return this.prisma.chatMessage.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        room: {
          select: {
            id: true,
            type: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Check if user has permission
   */
  private async checkMemberPermission(
    roomId: number,
    userId: number,
    allowedRoles: MemberRole[],
  ) {
    // Get user role first
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isSupport = ["ADMIN", "MANAGER", "STAFF"].includes(user?.role || "");

    // Support staff can bypass room-level permissions
    if (isSupport) {
      return;
    }

    const member = await this.prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (!member || member.leftAt) {
      throw new ForbiddenException("You are not a member of this room");
    }

    if (!allowedRoles.includes(member.role)) {
      throw new ForbiddenException(
        "You do not have permission to perform this action",
      );
    }

    return member;
  }

  // ============================================
  // FILE UPLOAD
  // ============================================

  /**
   * Generate presigned URL for file upload
   */
  async generatePresignedUrl(
    userId: number,
    fileName: string,
    fileType: string,
    fileSize: number,
  ) {
    // Validate file size (max 10MB for now)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (fileSize > MAX_FILE_SIZE) {
      throw new BadRequestException("File size exceeds 10MB limit");
    }

    // Validate file type (images, documents, etc.)
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];

    if (!allowedTypes.includes(fileType)) {
      throw new BadRequestException("File type not allowed");
    }

    // Generate unique file key
    // Note: We don't have roomId here yet, so use 0 as placeholder
    // In real implementation, you might want to pass roomId or generate after room creation
    const fileKey = this.s3Service.generateFileKey(userId, 0, fileName);

    // Generate presigned URL
    const { uploadUrl, fileUrl, key } =
      await this.s3Service.generatePresignedUploadUrl(fileKey, fileType);

    return {
      uploadUrl,
      fileUrl,
      key,
      fileName,
      fileType,
      fileSize,
    };
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  /**
   * Get list of users available for chat (excluding current user)
   * Returns all parents who are active in the system
   */
  async getAvailableUsers(currentUserId: number) {
    // Get all users except current user
    // Filter by role = PARENT or STUDENT (adjust based on your requirements)
    const users = await this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        role: { in: ["PARENT", "STUDENT"] },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Format response to match frontend interface
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      fullName: user.name,
      role: user.role,
      avatar: user.avatar,
    }));
  }
}
