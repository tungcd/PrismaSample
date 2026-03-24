import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateRoomDto,
  SendMessageDto,
  UpdateRoomDto,
  AddMemberDto,
  UpdateMemberRoleDto,
  EditMessageDto,
  MarkAsReadDto,
} from './dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  // ============================================
  // ROOM ENDPOINTS
  // ============================================

  /**
   * POST /chat/rooms
   * Create a new room
   */
  @Post('rooms')
  async createRoom(@Req() req, @Body() createRoomDto: CreateRoomDto) {
    return this.chatService.createRoom(req.user.id, createRoomDto);
  }

  /**
   * GET /chat/rooms
   * Get all rooms for current user
   */
  @Get('rooms')
  async getUserRooms(
    @Req() req,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const takeNum = take ? parseInt(take, 10) : 20;
    return this.chatService.getUserRooms(req.user.id, skipNum, takeNum);
  }

  /**
   * GET /chat/rooms/:id
   * Get room by ID
   */
  @Get('rooms/:id')
  async getRoomById(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.chatService.getRoomById(id, req.user.id);
  }

  /**
   * PATCH /chat/rooms/:id
   * Update room (name, avatar)
   */
  @Patch('rooms/:id')
  async updateRoom(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.chatService.updateRoom(id, req.user.id, updateRoomDto);
  }

  /**
   * DELETE /chat/rooms/:id
   * Delete/archive room
   */
  @Delete('rooms/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRoom(@Param('id', ParseIntPipe) id: number, @Req() req) {
    await this.chatService.deleteRoom(id, req.user.id);
  }

  /**
   * GET /chat/rooms/direct/:userId
   * Find or create direct room between current user and target user
   */
  @Get('rooms/direct/:userId')
  async getOrCreateDirectRoom(@Req() req, @Param('userId', ParseIntPipe) targetUserId: number) {
    // Try to find existing room
    const existingRoom = await this.chatService.findDirectRoom(req.user.id, targetUserId);
    
    if (existingRoom) {
      return existingRoom;
    }

    // Create new room
    const newRoom = await this.chatService.createRoom(req.user.id, {
      type: 'DIRECT',
      memberIds: [targetUserId],
    });
    
    return newRoom;
  }

  // ============================================
  // MEMBER ENDPOINTS
  // ============================================

  /**
   * POST /chat/rooms/:id/members
   * Add member to room
   */
  @Post('rooms/:id/members')
  async addMember(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.chatService.addMember(id, req.user.id, addMemberDto);
  }

  /**
   * DELETE /chat/rooms/:id/members/:userId
   * Remove member from room
   */
  @Delete('rooms/:id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req,
  ) {
    await this.chatService.removeMember(id, req.user.id, userId);
  }

  /**
   * POST /chat/rooms/:id/leave
   * Leave room
   */
  @Post('rooms/:id/leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  async leaveRoom(@Param('id', ParseIntPipe) id: number, @Req() req) {
    await this.chatService.leaveRoom(id, req.user.id);
  }

  /**
   * PATCH /chat/rooms/:id/members/:userId/role
   * Update member role
   */
  @Patch('rooms/:id/members/:userId/role')
  async updateMemberRole(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() updateRoleDto: UpdateMemberRoleDto,
  ) {
    return this.chatService.updateMemberRole(id, req.user.id, updateRoleDto);
  }

  // ============================================
  // MESSAGE ENDPOINTS
  // ============================================

  /**
   * GET /chat/rooms/:id/messages
   * Get messages in a room (paginated)
   */
  @Get('rooms/:id/messages')
  async getMessages(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Query('before') before?: string,
    @Query('after') after?: string,
    @Query('limit') limit?: string,
  ) {
    const beforeNum = before ? parseInt(before, 10) : undefined;
    const afterNum = after ? parseInt(after, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.chatService.getMessages(id, req.user.id, beforeNum, afterNum, limitNum);
  }

  /**
   * POST /chat/rooms/:id/messages
   * Send message
   */
  @Post('rooms/:id/messages')
  async sendMessage(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(id, req.user.id, sendMessageDto);
  }

  /**
   * PATCH /chat/messages/:id
   * Edit message
   */
  @Patch('messages/:id')
  async editMessage(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() editMessageDto: EditMessageDto,
  ) {
    return this.chatService.editMessage(id, req.user.id, editMessageDto);
  }

  /**
   * DELETE /chat/messages/:id
   * Delete message
   */
  @Delete('messages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMessage(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Query('forEveryone') forEveryone?: string,
  ) {
    await this.chatService.deleteMessage(id, req.user.id, forEveryone === 'true');
  }

  /**
   * POST /chat/messages/:id/reactions
   * Add reaction to message
   */
  @Post('messages/:id/reactions')
  async addReaction(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body('emoji') emoji: string,
  ) {
    return this.chatService.addReaction(id, req.user.id, emoji);
  }

  /**
   * DELETE /chat/messages/:id/reactions/:emoji
   * Remove reaction from message
   */
  @Delete('messages/:id/reactions/:emoji')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeReaction(
    @Param('id', ParseIntPipe) id: number,
    @Param('emoji') emoji: string,
    @Req() req,
  ) {
    await this.chatService.removeReaction(id, req.user.id, emoji);
  }

  /**
   * POST /chat/rooms/:id/read
   * Mark messages as read
   */
  @Post('rooms/:id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() markAsReadDto: MarkAsReadDto,
  ) {
    return this.chatService.markAsRead(id, req.user.id, markAsReadDto);
  }

  /**
   * GET /chat/messages/:id/reads
   * Get who read a message
   */
  @Get('messages/:id/reads')
  async getMessageReads(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.chatService.getMessageReads(id, req.user.id);
  }

  /**
   * GET /chat/search
   * Search messages
   */
  @Get('search')
  async searchMessages(
    @Req() req,
    @Query('q') query: string,
    @Query('roomId') roomId?: string,
    @Query('limit') limit?: string,
  ) {
    const roomIdNum = roomId ? parseInt(roomId, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.chatService.searchMessages(req.user.id, query, roomIdNum, limitNum);
  }
  // ============================================
  // FILE UPLOAD
  // ============================================

  /**
   * POST /chat/upload/presigned-url
   * Generate S3 presigned URL for file upload
   */
  @Post('upload/presigned-url')
  async generatePresignedUrl(
    @Req() req,
    @Body() body: { fileName: string; fileType: string; fileSize: number },
  ) {
    return this.chatService.generatePresignedUrl(
      req.user.id,
      body.fileName,
      body.fileType,
      body.fileSize,
    );
  }

  // ============================================
  // USER ENDPOINTS
  // ============================================

  /**
   * GET /chat/users/available
   * Get list of users available for chat (excluding current user)
   */
  @Get('users/available')
  async getAvailableUsers(@Req() req) {
    return this.chatService.getAvailableUsers(req.user.id);
  }
}
