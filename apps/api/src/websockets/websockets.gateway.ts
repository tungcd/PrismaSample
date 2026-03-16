import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketServer,
} from "@nestjs/websockets";
import { Logger, UseGuards } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { WsAuthGuard } from "./ws-auth.guard";

/**
 * Base WebSocket Gateway
 * Handles connection, disconnection, and online user tracking
 */
@WebSocketGateway({
  cors: {
    origin: [
      "http://localhost:3000", // CMS
      "http://localhost:3001", // Client
      process.env.CMS_URL,
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
  },
  namespace: "/", // Default namespace
})
@UseGuards(WsAuthGuard)
export class WebSocketsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketsGateway.name);

  // Track online users: userId → Set<socketId>
  private onlineUsers = new Map<number, Set<string>>();

  afterInit(server: Server) {
    this.logger.log("WebSocket Gateway initialized");
  }

  async handleConnection(client: Socket) {
    const user = client.data.user;

    if (!user) {
      this.logger.warn(`Connection rejected: No user data`);
      client.disconnect();
      return;
    }

    // Track user connection
    if (!this.onlineUsers.has(user.userId)) {
      this.onlineUsers.set(user.userId, new Set());
    }
    this.onlineUsers.get(user.userId)!.add(client.id);

    // Join user to their personal room (for targeted notifications)
    await client.join(`user:${user.userId}`);

    // Join role-based rooms
    await client.join(`role:${user.role}`);

    this.logger.log(
      `Client connected: ${client.id} | User: ${user.email} (ID: ${user.userId}) | Role: ${user.role} | Online users: ${this.onlineUsers.size}`,
    );

    // Notify client of successful connection
    client.emit("connection:success", {
      message: "Connected to Smart Canteen WebSocket",
      userId: user.userId,
      socketId: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;

    if (user) {
      // Remove socket from user's connection set
      const userSockets = this.onlineUsers.get(user.userId);
      if (userSockets) {
        userSockets.delete(client.id);

        // If user has no more connections, remove from online users
        if (userSockets.size === 0) {
          this.onlineUsers.delete(user.userId);
        }
      }

      this.logger.log(
        `Client disconnected: ${client.id} | User: ${user.email} | Online users: ${this.onlineUsers.size}`,
      );
    } else {
      this.logger.log(`Client disconnected: ${client.id} (unauthenticated)`);
    }
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: number): boolean {
    return (
      this.onlineUsers.has(userId) && this.onlineUsers.get(userId)!.size > 0
    );
  }

  /**
   * Get all socket IDs for a user
   */
  getUserSockets(userId: number): string[] {
    return Array.from(this.onlineUsers.get(userId) || []);
  }

  /**
   * Get online user count
   */
  getOnlineUserCount(): number {
    return this.onlineUsers.size;
  }

  /**
   * Emit event to specific user (all their connected devices)
   */
  emitToUser(userId: number, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Emit event to specific role
   */
  emitToRole(role: string, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, data);
  }
}
