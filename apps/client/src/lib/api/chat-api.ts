import { api } from ".";
import type { Room, ChatMessage } from "../chat-socket";

export interface CreateRoomDto {
  type: "DIRECT" | "GROUP";
  name?: string;
  avatar?: string;
  memberIds: number[];
}

export interface SendMessageDto {
  content: string;
  contentType?: string;
  replyToId?: number;
  metadata?: any;
  attachments?: Array<{
    url: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }>;
}

export const chatApi = {
  // ============================================
  // ROOMS
  // ============================================

  /**
   * Get all user's rooms
   */
  async getRooms(skip = 0, take = 20): Promise<Room[]> {
    return api.get(`/chat/rooms?skip=${skip}&take=${take}`);
  },

  /**
   * Get room by ID
   */
  async getRoom(roomId: number): Promise<Room> {
    return api.get(`/chat/rooms/${roomId}`);
  },

  /**
   * Create new room
   */
  async createRoom(dto: CreateRoomDto): Promise<Room> {
    return api.post("/chat/rooms", dto);
  },

  /**
   * Get or create direct room with another user
   */
  async getOrCreateDirectRoom(userId: number): Promise<Room> {
    return api.get(`/chat/rooms/direct/${userId}`);
  },

  /**
   * Update room (name, avatar)
   */
  async updateRoom(roomId: number, data: { name?: string; avatar?: string }): Promise<Room> {
    return api.patch(`/chat/rooms/${roomId}`, data);
  },

  /**
   * Delete/archive room
   */
  async deleteRoom(roomId: number): Promise<void> {
    await api.delete(`/chat/rooms/${roomId}`);
  },

  // ============================================
  // MESSAGES
  // ============================================

  /**
   * Get messages in a room (paginated)
   */
  async getMessages(
    roomId: number,
    options?: {
      before?: number;
      after?: number;
      limit?: number;
    },
  ): Promise<{
    messages: ChatMessage[];
    hasMore: boolean;
    oldestMessageId: number;
    newestMessageId: number;
  }> {
    const params = new URLSearchParams();
    if (options?.before) params.append("before", options.before.toString());
    if (options?.after) params.append("after", options.after.toString());
    if (options?.limit) params.append("limit", options.limit.toString());

    return api.get(`/chat/rooms/${roomId}/messages?${params}`);
  },

  /**
   * Send message (via REST as fallback)
   */
  async sendMessage(roomId: number, dto: SendMessageDto): Promise<ChatMessage> {
    return api.post(`/chat/rooms/${roomId}/messages`, dto);
  },

  /**
   * Edit message
   */
  async editMessage(messageId: number, content: string): Promise<ChatMessage> {
    return api.patch(`/chat/messages/${messageId}`, { content });
  },

  /**
   * Delete message
   */
  async deleteMessage(messageId: number, forEveryone: boolean): Promise<void> {
    await api.delete(`/chat/messages/${messageId}?forEveryone=${forEveryone}`);
  },

  // ============================================
  // REACTIONS
  // ============================================

  /**
   * Add reaction to message
   */
  async addReaction(messageId: number, emoji: string): Promise<any> {
    return api.post(`/chat/messages/${messageId}/reactions`, { emoji });
  },

  /**
   * Remove reaction from message
   */
  async removeReaction(messageId: number, emoji: string): Promise<void> {
    await api.delete(`/chat/messages/${messageId}/reactions/${emoji}`);
  },

  // ============================================
  // READ RECEIPTS
  // ============================================

  /**
   * Mark messages as read
   */
  async markAsRead(
    roomId: number,
    lastSeenMessageId?: number,
  ): Promise<{ success: boolean; markedCount: number }> {
    return api.post(`/chat/rooms/${roomId}/read`, {
      lastSeenMessageId,
    });
  },

  /**
   * Get who read a message
   */
  async getMessageReads(messageId: number): Promise<
    Array<{
      userId: number;
      readAt: string;
      user: {
        id: number;
        name: string;
        avatar?: string;
      };
    }>
  > {
    return api.get(`/chat/messages/${messageId}/reads`);
  },

  // ============================================
  // SEARCH
  // ============================================

  /**
   * Search messages
   */
  async searchMessages(
    query: string,
    roomId?: number,
    limit = 20,
  ): Promise<ChatMessage[]> {
    const params = new URLSearchParams({ q: query, limit: limit.toString() });
    if (roomId) params.append("roomId", roomId.toString());

    return api.get(`/chat/search?${params}`);
  },

  // ============================================
  // MEMBERS
  // ============================================

  /**
   * Add member to room
   */
  async addMember(roomId: number, userId: number): Promise<any> {
    return api.post(`/chat/rooms/${roomId}/members`, { userId });
  },

  /**
   * Remove member from room
   */
  async removeMember(roomId: number, userId: number): Promise<void> {
    await api.delete(`/chat/rooms/${roomId}/members/${userId}`);
  },

  /**
   * Leave room
   */
  async leaveRoom(roomId: number): Promise<void> {
    await api.post(`/chat/rooms/${roomId}/leave`);
  },

  /**
   * Update member role
   */
  async updateMemberRole(
    roomId: number,
    userId: number,
    role: "OWNER" | "ADMIN" | "MEMBER",
  ): Promise<any> {
    return api.patch(`/chat/rooms/${roomId}/members/${userId}/role`, {
      userId,
      role,
    });
  },

  // ============================================
  // FILE UPLOAD
  // ============================================

  /**
   * Get presigned URL for file upload
   */
  async getPresignedUploadUrl(data: {
    fileName: string;
    fileType: string;
    fileSize: number;
  }): Promise<{
    uploadUrl: string;
    fileUrl: string;
    key: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }> {
    return api.post("/chat/upload/presigned-url", data);
  },

  // ============================================
  // USERS
  // ============================================

  /**
   * Get available users for chat (excluding current user)
   */
  async getAvailableUsers(): Promise<Array<{
    id: number;
    email: string;
    fullName: string;
    role: string;
    avatar?: string;
  }>> {
    return api.get("/chat/users/available");
  },
};
