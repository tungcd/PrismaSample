# Smart Canteen - Architecture Documentation

> **Version:** 1.0  
> **Last Updated:** March 24, 2026  
> **Purpose:** Tài liệu kiến trúc đầy đủ cho việc onboarding và tiếp tục phát triển dự án

---

## 📋 Table of Contents

1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Tech Stack](#2-tech-stack)
3. [Database Architecture](#3-database-architecture)
4. [WebSocket Architecture](#4-websocket-architecture)
5. [Chat System](#5-chat-system)
6. [Notification System](#6-notification-system)
7. [Project Structure](#7-project-structure)
8. [Setup Instructions](#8-setup-instructions)
9. [Key Implementation Details](#9-key-implementation-details)
10. [Common Issues & Solutions](#10-common-issues--solutions)

---

## 1. Tổng Quan Hệ Thống

### 1.1 Mô Tả Dự Án

**Smart Canteen** là hệ thống quản lý căng tin thông minh cho trường học, bao gồm:
- 🏫 **CMS (Content Management System)**: Desktop web app cho admin/staff quản lý
- 📱 **CLIENT**: Mobile-first web app cho học sinh/phụ huynh
- ⚙️ **API**: Backend NestJS với WebSocket real-time

### 1.2 Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS                                │
│  Admin/Staff (Desktop) │ Students/Parents (Mobile)          │
└────────────┬────────────┴────────────┬─────────────────────┘
             │                         │
             ▼                         ▼
    ┌────────────────┐        ┌────────────────┐
    │   CMS (3000)   │        │ CLIENT (3001)  │
    │   Next.js 14   │        │   Next.js 14   │
    │   Tailwind CSS │        │   Tailwind CSS │
    └────────┬───────┘        └────────┬───────┘
             │                         │
             └────────────┬────────────┘
                          │
                   HTTP + WebSocket
                          │
                          ▼
             ┌────────────────────────┐
             │    API (4000)          │
             │    NestJS + Socket.IO  │
             │    - REST API          │
             │    - WebSocket Gateway │
             │    - Authentication    │
             └────────────┬───────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
    ┌──────────────────┐    ┌──────────────────┐
    │  PostgreSQL      │    │  AWS S3          │
    │  (5432)          │    │  (File Storage)  │
    │  - User data     │    │  - Images        │
    │  - Orders        │    │  - Documents     │
    │  - Chat messages │    └──────────────────┘
    │  - Notifications │
    └──────────────────┘
```

### 1.3 Core Features

#### Admin/Staff (CMS)
- 👥 Quản lý users (students, parents, staff)
- 🍔 Quản lý products & categories
- 📦 Quản lý orders & inventory
- 💰 Quản lý top-up requests & wallet
- 🎟️ Quản lý promotions & vouchers
- 💬 Chat với học sinh/phụ huynh
- 🔔 Notifications real-time

#### Students/Parents (CLIENT)
- 🛒 Browse & order products
- 💳 Wallet management & top-up
- 📝 Order history
- 💬 Chat với admin/staff
- 🔔 Notifications real-time
- 👤 Profile management

---

## 2. Tech Stack

### 2.1 Frontend

#### CMS & CLIENT (Giống nhau)
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.x | React framework (App Router) |
| **React** | 18.x | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 3.x | Styling |
| **shadcn/ui** | Latest | Component library |
| **Socket.IO Client** | 4.x | WebSocket client |
| **Recharts** | 2.x | Charts & analytics |
| **React Hook Form** | 7.x | Form handling |
| **Zod** | 3.x | Schema validation |

### 2.2 Backend (API)

| Technology | Version | Purpose |
|------------|---------|---------|
| **NestJS** | 10.x | Node.js framework |
| **TypeScript** | 5.x | Type safety |
| **Prisma** | 5.22 | ORM & migrations |
| **PostgreSQL** | 15.x | Primary database |
| **Socket.IO** | 4.x | WebSocket server |
| **JWT** | Latest | Authentication |
| **Passport** | Latest | Auth strategies |
| **AWS SDK** | 3.x | S3 file uploads |
| **Class Validator** | Latest | DTO validation |

### 2.3 DevOps & Tools

| Tool | Purpose |
|------|---------|
| **Docker** | Containerization (PostgreSQL) |
| **Turbo** | Monorepo build system |
| **pnpm** | Package manager |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |

---

## 3. Database Architecture

### 3.1 Schema Overview

```prisma
// Core Models
User ──┬──> Student
       ├──> Parent
       └──> Role (ADMIN, STAFF, STUDENT, PARENT)

// E-commerce
Product ──> Category
Order ──> OrderItem ──> Product
Promotion ──> Product
Voucher ──> User

// Wallet & Balance
User ──> Wallet ──> TopUpRequest
Order ──> payment via Wallet

// Chat System
Room ──┬──> RoomMember ──> User
       └──> ChatMessage ──┬──> MessageReaction
                          ├──> MessageRead
                          └──> replyTo: ChatMessage

// Notifications
User ──> Notification
```

### 3.2 Key Models Detail

#### User & Authentication
```prisma
model User {
  id            Int      @id @default(autoincrement())
  email         String   @unique
  password      String   // Hashed with bcrypt
  name          String
  phone         String?
  role          Role     @default(STUDENT)
  avatarUrl     String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  
  // Relations
  student       Student?
  parent        Parent?
  wallet        Wallet?
  orders        Order[]
  notifications Notification[]
}

enum Role {
  ADMIN
  STAFF
  STUDENT
  PARENT
}
```

#### Chat System
```prisma
model Room {
  id            Int      @id @default(autoincrement())
  type          RoomType // DIRECT, GROUP
  name          String?
  avatarUrl     String?
  lastMessageId Int?
  lastMessageAt DateTime?
  createdAt     DateTime @default(now())
  
  members       RoomMember[]
  messages      ChatMessage[]
}

enum RoomType {
  DIRECT   // 1-on-1 chat
  GROUP    // Group chat (future)
}

model RoomMember {
  roomId            Int
  userId            Int
  role              MemberRole @default(MEMBER)
  lastReadMessageId Int?
  unreadCount       Int        @default(0)
  joinedAt          DateTime   @default(now())
  
  room Room @relation(fields: [roomId], references: [id])
  user User @relation(fields: [userId], references: [id])
  
  @@id([roomId, userId])
}

enum MemberRole {
  ADMIN   // Can manage room settings
  MEMBER  // Regular member
}

model ChatMessage {
  id          Int      @id @default(autoincrement())
  roomId      Int
  senderId    Int
  content     String   @db.Text
  contentType MessageContentType @default(TEXT)
  replyToId   Int?     // Reply to another message
  
  // Deletion
  isDeleted   Boolean  @default(false)
  deletedFor  Int[]    // Array of userIds (delete for me)
  deletedAt   DateTime?
  
  // Edit
  isEdited    Boolean  @default(false)
  editedAt    DateTime?
  
  // Status
  status      MessageStatus @default(SENT)
  
  createdAt   DateTime @default(now())
  
  // Relations
  room        Room @relation(fields: [roomId], references: [id])
  sender      User @relation(fields: [senderId], references: [id])
  replyTo     ChatMessage? @relation("MessageReplies", fields: [replyToId], references: [id])
  replies     ChatMessage[] @relation("MessageReplies")
  reactions   MessageReaction[]
  reads       MessageRead[]
}

enum MessageContentType {
  TEXT
  IMAGE
  FILE
  SYSTEM  // System messages (e.g., "User joined")
}

enum MessageStatus {
  SENDING
  SENT
  DELIVERED
  FAILED
}

model MessageReaction {
  id        Int      @id @default(autoincrement())
  messageId Int
  userId    Int
  emoji     String   // "👍", "❤️", etc.
  createdAt DateTime @default(now())
  
  message ChatMessage @relation(fields: [messageId], references: [id])
  user    User        @relation(fields: [userId], references: [id])
  
  @@unique([messageId, userId, emoji])
}

model MessageRead {
  id        Int      @id @default(autoincrement())
  messageId Int
  userId    Int
  readAt    DateTime @default(now())
  
  message ChatMessage @relation(fields: [messageId], references: [id])
  user    User        @relation(fields: [userId], references: [id])
  
  @@unique([messageId, userId])
}
```

#### Notification System
```prisma
model Notification {
  id             Int              @id @default(autoincrement())
  userId         Int
  type           NotificationType
  title          String
  message        String           @db.Text
  actionUrl      String?
  isRead         Boolean          @default(false)
  readAt         DateTime?
  priority       NotificationPriority @default(NORMAL)
  metadata       Json?
  createdAt      DateTime         @default(now())
  
  user User @relation(fields: [userId], references: [id])
}

enum NotificationType {
  ORDER_CONFIRMED
  ORDER_READY
  ORDER_COMPLETED
  TOP_UP_APPROVED
  TOP_UP_REJECTED
  WALLET_UPDATED
  CHAT_MESSAGE
  SYSTEM_ANNOUNCEMENT
  INFO
}

enum NotificationPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}
```

### 3.3 Database Migrations

**Location:** `packages/prisma/migrations/`

**Key Commands:**
```bash
cd packages/prisma

# Create migration
npx prisma migrate dev --name <migration_name>

# Apply migrations (production)
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Reset database (DEV ONLY - destroys data!)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

---

## 4. WebSocket Architecture

### 4.1 Socket Design - Single Namespace

**Trước đây (Phức tạp):**
- Main namespace `/` cho notifications
- `/chat` namespace riêng cho chat
- 2 socket connections per client
- Phức tạp, khó maintain

**Hiện tại (Đơn giản):**
- **1 socket duy nhất** trên namespace `/`
- Chat events và notification events cùng socket
- Đơn giản, ít resource, dễ debug

### 4.2 Backend Socket Structure

```
apps/api/src/
  websockets/
    websockets.gateway.ts     # Main gateway - Authentication & room management
    websockets.module.ts      # Export gateway
    ws-auth.guard.ts          # JWT verification guard
    notification.gateway.ts   # Notification events (deprecated, merged)
    
  chat/
    chat.gateway.ts           # Chat events - uses main socket
    chat.service.ts           # Chat business logic
    chat.module.ts            # Import WebSocketsModule
```

#### WebSocketsGateway (Main)
**Responsibility:**
- Authenticate user via JWT
- Join user to rooms: `user:${userId}`, `role:${role}`
- Track online users
- Provide utility methods: `emitToUser()`, `isUserOnline()`

**Flow:**
```typescript
@WebSocketGateway()
export class WebSocketsGateway {
  private onlineUsers = new Map<userId, Set<socketIds>>();
  
  async handleConnection(client: Socket) {
    // 1. Extract JWT from query/auth/headers
    const token = client.handshake.query.token;
    
    // 2. Verify JWT
    const payload = await this.jwtService.verifyAsync(token);
    
    // 3. Set user data
    client.data.user = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role
    };
    
    // 4. Track online status
    this.onlineUsers.get(userId)?.add(client.id);
    
    // 5. Join rooms
    await client.join(`user:${userId}`);    // For notifications
    await client.join(`role:${role}`);       // For broadcasts
    
    // 6. Confirm connection
    client.emit('connection:success', { userId, socketId: client.id });
  }
  
  handleDisconnect(client: Socket) {
    // Cleanup online users, rooms
  }
  
  // Utility
  emitToUser(userId: number, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
  
  isUserOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }
}
```

#### ChatGateway
**Responsibility:**
- Handle chat events: send, edit, delete, react, typing
- Join user to chat rooms: `room:${roomId}`
- Broadcast to room members
- Create notifications for recipients

**Flow:**
```typescript
@WebSocketGateway()
@UseGuards(WsAuthGuard)  // Reuse authentication
export class ChatGateway implements OnGatewayConnection {
  constructor(
    private webSocketsGateway: WebSocketsGateway,  // Inject main gateway
  ) {}
  
  async handleConnection(client: Socket) {
    const userId = client.data.user.userId;
    
    // Get user's chat rooms
    const rooms = await this.chatService.getUserRooms(userId);
    
    // Join each room
    for (const room of rooms) {
      await client.join(`room:${room.id}`);
    }
  }
  
  @SubscribeMessage('message:send')
  async handleSendMessage(client, data) {
    // Save to DB
    const message = await this.chatService.sendMessage(...);
    
    // Broadcast to room
    this.server.to(`room:${roomId}`).emit('message:new', message);
    
    // Create notifications for recipients
    for (const recipientId of recipients) {
      const notification = await this.notificationsService.create({...});
      
      // Emit via main gateway
      this.webSocketsGateway.emitToUser(recipientId, 'notification:new', notification);
    }
  }
}
```

### 4.3 Socket Rooms Structure

```
Socket Rooms (Per User):
  user:1              → For personal notifications
  role:ADMIN          → For role-based broadcasts
  room:5              → Chat room 5
  room:8              → Chat room 8
  room:12             → Chat room 12
```

**Example:**
```
Admin user (ID: 1) joins:
  - user:1
  - role:ADMIN
  - room:5, room:8, room:12 (their chat rooms)

Student user (ID: 10) joins:
  - user:10
  - role:STUDENT
  - room:5 (chat with admin)
```

### 4.4 Frontend Socket Structure

```
apps/cms/src/lib/
  socket-context.tsx         # Main socket provider
  chat-socket.tsx            # Chat features (reuse main socket)
  use-notifications.ts       # Notification listener
  
apps/client/src/lib/
  socket-context.tsx         # Same as CMS
  chat-socket.tsx            # Same as CMS
  use-notifications.ts       # Same as CMS
```

#### SocketProvider (Main)
```typescript
export function SocketProvider({ children }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const connect = useCallback((token: string) => {
    const newSocket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      query: { token }  // Send JWT
    });
    
    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));
    
    setSocket(newSocket);
  }, []);
  
  return (
    <SocketContext.Provider value={{ socket, isConnected, connect }}>
      {children}
    </SocketContext.Provider>
  );
}
```

#### ChatSocketProvider (Wrapper)
```typescript
export function ChatSocketProvider({ children }) {
  // Get main socket
  const { socket: mainSocket, isConnected } = useSocket();
  
  // Reuse main socket for chat features
  const sendMessage = useCallback((roomId, content) => {
    mainSocket?.emit('message:send', { roomId, content });
  }, [mainSocket]);
  
  // Listen to chat events
  useEffect(() => {
    if (!mainSocket) return;
    
    mainSocket.on('message:new', handleNewMessage);
    mainSocket.on('message:edited', handleEditedMessage);
    
    return () => {
      mainSocket.off('message:new', handleNewMessage);
      mainSocket.off('message:edited', handleEditedMessage);
    };
  }, [mainSocket]);
  
  return (
    <ChatSocketContext.Provider value={{ sendMessage, ... }}>
      {children}
    </ChatSocketContext.Provider>
  );
}
```

---

## 5. Chat System

### 5.1 Chat Flow Diagram

```
USER ACTION                    FRONTEND                     BACKEND                      DATABASE
─────────────────────────────────────────────────────────────────────────────────────────────────

[User gõ message]
    │
    ├──> sendMessage("Hello")
    │         │
    │         ├──> Optimistic update UI
    │         │    (show message immediately)
    │         │
    │         └──> socket.emit('message:send', {...})
    │                                           │
    │                                           ├──> @SubscribeMessage('message:send')
    │                                           │         │
    │                                           │         ├──> Verify permissions
    │                                           │         │
    │                                           │         ├──> chatService.sendMessage()
    │                                           │         │              │
    │                                           │         │              └──> prisma.chatMessage.create()
    │                                           │         │                              │
    │                                           │         │                              └──> Save to DB
    │                                           │         │
    │                                           │         ├──> Update room.lastMessage
    │                                           │         │
    │                                           │         ├──> Broadcast to room
    │                                           │         │    server.to('room:5').emit('message:new')
    │                                           │         │
    │                                           │         └──> Create notifications
    │                                           │                   │
    │                                           │                   └──> for each recipient:
    │                                           │                        notificationService.create()
    │                                           │                        emitToUser('notification:new')
    │                                           │
    │         ┌─────────────────────────────────┴─────────────────────┐
    │         │                                                       │
    └───> socket.on('message:new')                    socket.on('notification:new')
              │                                                       │
              ├──> Update messages state                             ├──> Show notification bell
              ├──> Update room's unreadCount                         └──> Browser notification
              └──> Scroll to bottom
```

### 5.2 Key Chat Features

#### 5.2.1 Send Message
```typescript
// Frontend
const sendMessage = (content: string, replyToId?: number) => {
  socket.emit('message:send', { roomId, content, replyToId });
};

// Backend
@SubscribeMessage('message:send')
async handleSendMessage(client, data) {
  const message = await this.chatService.sendMessage(
    data.roomId,
    client.userId,
    { content: data.content, replyToId: data.replyToId }
  );
  
  // Broadcast
  this.server.to(`room:${data.roomId}`).emit('message:new', {
    roomId: data.roomId,
    message
  });
}
```

#### 5.2.2 Edit Message
```typescript
socket.emit('message:edit', { messageId, content });

// Backend checks ownership
if (message.senderId !== client.userId) {
  throw new ForbiddenException();
}

// Update & broadcast
this.server.to(`room:${roomId}`).emit('message:edited', {
  messageId,
  content,
  isEdited: true,
  editedAt: new Date()
});
```

#### 5.2.3 Delete Message

**Delete for me:**
```typescript
socket.emit('message:delete', { messageId, forEveryone: false });

// Backend: Add userId to deletedFor array
await prisma.chatMessage.update({
  where: { id: messageId },
  data: { deletedFor: { push: userId } }
});
```

**Delete for everyone (sender only):**
```typescript
socket.emit('message:delete', { messageId, forEveryone: true });

// Backend
await prisma.chatMessage.update({
  where: { id: messageId },
  data: { isDeleted: true, deletedAt: new Date() }
});
```

#### 5.2.4 Reactions
```typescript
// Add reaction
socket.emit('reaction:add', { messageId, emoji: '👍' });

// Remove reaction
socket.emit('reaction:remove', { messageId, emoji: '👍' });

// Backend broadcasts
this.server.to(`room:${roomId}`).emit('reaction:added', {
  messageId,
  userId,
  emoji,
  userName
});
```

#### 5.2.5 Typing Indicators
```typescript
// Start typing
socket.emit('typing:start', { roomId });

// Backend
this.typingIndicators.get(roomId)?.add(userId);
client.to(`room:${roomId}`).emit('typing:started', { roomId, userId });

// Auto-stop after 3 seconds
setTimeout(() => {
  socket.emit('typing:stop', { roomId });
}, 3000);
```

#### 5.2.6 Read Receipts
```typescript
// Mark as read when user opens room
socket.emit('messages:read', { roomId, lastReadMessageId: 999 });

// Backend creates MessageRead records
await prisma.messageRead.createMany({
  data: unreadMessages.map(msg => ({
    messageId: msg.id,
    userId,
    readAt: new Date()
  }))
});

// Broadcast
this.server.to(`room:${roomId}`).emit('messages:read', {
  roomId,
  userId,
  lastReadMessageId
});
```

### 5.3 Chat Service Methods

**Key methods in `chat.service.ts`:**

```typescript
class ChatService {
  // Room management
  createRoom(dto: CreateRoomDto, creatorId: number): Promise<Room>
  getUserRooms(userId: number): Promise<Room[]>
  getRoomById(roomId: number, userId: number): Promise<Room>
  
  // Messages
  sendMessage(roomId: number, senderId: number, dto: SendMessageDto): Promise<ChatMessage>
  getMessages(roomId: number, userId: number, limit: number, cursor?: number): Promise<ChatMessage[]>
  editMessage(messageId: number, userId: number, dto: EditMessageDto): Promise<ChatMessage>
  deleteMessage(messageId: number, userId: number, forEveryone: boolean): Promise<void>
  
  // Reactions
  addReaction(messageId: number, userId: number, emoji: string): Promise<MessageReaction>
  removeReaction(messageId: number, userId: number, emoji: string): Promise<void>
  
  // Read receipts
  markAsRead(roomId: number, userId: number, dto: MarkAsReadDto): Promise<void>
  getMessageReads(messageId: number): Promise<MessageRead[]>
  
  // Search
  searchMessages(roomId: number, query: string, userId: number): Promise<ChatMessage[]>
}
```

---

## 6. Notification System

### 6.1 Notification Flow

```
TRIGGER EVENT                                 BACKEND                              FRONTEND
─────────────────────────────────────────────────────────────────────────────────────────────

[Order confirmed]
    │
    └──> ordersService.confirmOrder()
              │
              └──> notificationsService.create({
                     userId,
                     type: 'ORDER_CONFIRMED',
                     title: 'Đơn hàng đã được xác nhận',
                     message: 'Đơn hàng #123 đang được chuẩn bị',
                     actionUrl: '/orders/123'
                   })
                        │
                        ├──> Save to database
                        │
                        └──> notificationGateway.emitNotificationToUser()
                                  │
                                  ├──> Check if user online
                                  │    webSocketsGateway.isUserOnline(userId)
                                  │
                                  └──> Emit to user's socket
                                       webSocketsGateway.emitToUser(
                                         userId,
                                         'notification:new',
                                         notification
                                       )
                                            │
                                            └──> server.to('user:${userId}').emit(...)
                                                       │
                        ┌──────────────────────────────┴────────────────────────────┐
                        │                                                           │
                   CMS Frontend                                              CLIENT Frontend
                        │                                                           │
                   socket.on('notification:new')                            socket.on('notification:new')
                        │                                                           │
                        ├──> Update notification state                              ├──> Update state
                        ├──> Increment bell badge count                             ├──> Show badge
                        ├──> Show browser notification                              ├──> Browser notification
                        └──> Play sound (optional)                                  └──> Play sound
```

### 6.2 Notification Types

```typescript
enum NotificationType {
  // Order related
  ORDER_CONFIRMED      // Đơn hàng đã được xác nhận
  ORDER_READY          // Đơn hàng đã sẵn sàng
  ORDER_COMPLETED      // Đơn hàng hoàn thành
  ORDER_CANCELLED      // Đơn hàng bị hủy
  
  // Wallet related
  TOP_UP_APPROVED      // Nạp tiền được duyệt
  TOP_UP_REJECTED      // Nạp tiền bị từ chối
  WALLET_UPDATED       // Số dư ví thay đổi
  
  // Chat related
  CHAT_MESSAGE         // Tin nhắn mới
  
  // System
  SYSTEM_ANNOUNCEMENT  // Thông báo hệ thống
  INFO                 // Thông tin chung
}

enum NotificationPriority {
  LOW      // Không quan trọng
  NORMAL   // Bình thường
  HIGH     // Quan trọng
  URGENT   // Khẩn cấp
}
```

### 6.3 Creating Notifications

```typescript
// Backend - notificationsService.create()
async create(dto: CreateNotificationDto) {
  // 1. Save to database
  const notification = await this.prisma.notification.create({
    data: {
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      actionUrl: dto.actionUrl,
      priority: dto.priority || NotificationPriority.NORMAL,
      metadata: dto.metadata
    }
  });
  
  // 2. Emit to user via WebSocket (if online)
  await this.notificationGateway.emitNotificationToUser(
    dto.userId,
    notification
  );
  
  return notification;
}

// Usage example in other services
async confirmOrder(orderId: number) {
  const order = await this.prisma.order.update({
    where: { id: orderId },
    data: { status: 'CONFIRMED' }
  });
  
  // Create notification
  await this.notificationsService.create({
    userId: order.userId,
    type: NotificationType.ORDER_CONFIRMED,
    title: 'Đơn hàng đã được xác nhận',
    message: `Đơn hàng #${orderId} đang được chuẩn bị`,
    actionUrl: `/orders/${orderId}`,
    priority: NotificationPriority.HIGH
  });
}
```

### 6.4 Frontend Notification Hook

```typescript
// use-notifications.ts
export function useNotifications() {
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Listen to new notifications
  useEffect(() => {
    if (!socket) return;
    
    const handleNewNotification = (notification: Notification) => {
      // Add to state
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
          tag: `notification-${notification.id}`
        });
      }
      
      // Play sound (optional)
      new Audio('/notification.mp3').play();
    };
    
    socket.on('notification:new', handleNewNotification);
    
    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket]);
  
  // Mark as read
  const markAsRead = async (notificationId: number) => {
    await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'POST'
    });
    
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  return { notifications, unreadCount, markAsRead };
}
```

---

## 7. Project Structure

### 7.1 Monorepo Layout

```
demo_prisma/
├── apps/
│   ├── api/                    # Backend NestJS
│   │   ├── src/
│   │   │   ├── auth/           # Authentication (JWT, Passport)
│   │   │   ├── users/          # User management
│   │   │   ├── students/       # Student-specific logic
│   │   │   ├── products/       # Product CRUD
│   │   │   ├── categories/     # Category management
│   │   │   ├── orders/         # Order processing
│   │   │   ├── cart/           # Shopping cart
│   │   │   ├── wallet/         # Wallet & balance
│   │   │   ├── top-up-requests/# Top-up approval flow
│   │   │   ├── promotions/     # Promotions & discounts
│   │   │   ├── vouchers/       # Voucher management
│   │   │   ├── reports/        # Analytics & reports
│   │   │   ├── chat/           # Chat system
│   │   │   │   ├── chat.gateway.ts
│   │   │   │   ├── chat.service.ts
│   │   │   │   ├── chat.controller.ts
│   │   │   │   ├── chat.module.ts
│   │   │   │   └── dto/
│   │   │   ├── notifications/  # Notification system
│   │   │   │   ├── notifications.service.ts
│   │   │   │   ├── notifications.controller.ts
│   │   │   │   └── notifications.module.ts
│   │   │   ├── websockets/     # Main WebSocket gateway
│   │   │   │   ├── websockets.gateway.ts
│   │   │   │   ├── websockets.module.ts
│   │   │   │   ├── ws-auth.guard.ts
│   │   │   │   └── notification.gateway.ts (deprecated)
│   │   │   ├── infrastructure/ # S3, email, etc.
│   │   │   ├── prisma/         # Prisma service
│   │   │   ├── common/         # Shared utilities
│   │   │   ├── health/         # Health check endpoints
│   │   │   └── client-config/  # Frontend config API
│   │   ├── test/               # E2E tests
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── cms/                    # CMS Frontend (Next.js)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/     # Auth pages (login, register)
│   │   │   │   ├── dashboard/  # Main dashboard
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── products/
│   │   │   │   │   ├── orders/
│   │   │   │   │   ├── users/
│   │   │   │   │   ├── inventory/
│   │   │   │   │   ├── reports/
│   │   │   │   │   ├── chat/
│   │   │   │   │   │   ├── page.tsx           # Chat list
│   │   │   │   │   │   ├── [id]/page.tsx      # Chat room
│   │   │   │   │   │   └── layout.tsx         # ChatSocketProvider
│   │   │   │   │   ├── settings/
│   │   │   │   │   └── layout.tsx
│   │   │   │   └── layout.tsx  # Root layout
│   │   │   ├── components/
│   │   │   │   ├── ui/         # shadcn/ui components
│   │   │   │   ├── chat/
│   │   │   │   │   ├── chat-room.tsx
│   │   │   │   │   ├── message-item.tsx
│   │   │   │   │   └── message-input.tsx
│   │   │   │   ├── notification-bell.tsx
│   │   │   │   ├── providers.tsx
│   │   │   │   └── ...
│   │   │   ├── lib/
│   │   │   │   ├── socket-context.tsx       # Main socket
│   │   │   │   ├── chat-socket.tsx          # Chat features
│   │   │   │   ├── use-notifications.ts     # Notification hook
│   │   │   │   ├── hooks/
│   │   │   │   │   └── use-chat.ts          # Chat state management
│   │   │   │   ├── api-client.ts
│   │   │   │   └── utils.ts
│   │   │   └── types/
│   │   ├── public/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── client/                 # Client Frontend (Next.js)
│       ├── src/                # Structure tương tự CMS
│       │   ├── app/
│       │   │   ├── (student)/  # Student pages
│       │   │   │   ├── page.tsx
│       │   │   │   ├── menu/
│       │   │   │   ├── orders/
│       │   │   │   ├── wallet/
│       │   │   │   ├── chat/
│       │   │   │   └── profile/
│       │   │   └── layout.tsx
│       │   └── ...
│       └── package.json
│
├── packages/
│   ├── prisma/                 # Shared Prisma schema
│   │   ├── schema.prisma       # Database schema
│   │   ├── migrations/         # Migration history
│   │   ├── index.ts            # Export PrismaClient
│   │   └── package.json
│   ├── types/                  # Shared TypeScript types
│   └── utils/                  # Shared utilities
│
├── docker-compose.yml          # PostgreSQL container
├── turbo.json                  # Turbo build config
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # pnpm workspace config
├── README.md                   # Project overview
├── SETUP.md                    # Setup instructions
└── ARCHITECTURE.md             # This file
```

### 7.2 Key Files & Their Purpose

| File | Purpose |
|------|---------|
| `apps/api/src/main.ts` | API entry point, CORS, validation pipe setup |
| `apps/api/src/app.module.ts` | Root module, imports all feature modules |
| `apps/api/src/auth/jwt.strategy.ts` | JWT authentication strategy |
| `packages/prisma/schema.prisma` | Single source of truth for database schema |
| `apps/cms/src/app/layout.tsx` | Root layout, providers (SocketProvider) |
| `apps/cms/src/components/providers.tsx` | Client providers + SocketConnector |
| `apps/cms/src/lib/socket-context.tsx` | Main WebSocket connection logic |
| `docker-compose.yml` | PostgreSQL + optional Redis |

---

## 8. Setup Instructions

### 8.1 Prerequisites

```bash
# Required
Node.js >= 18
pnpm >= 8
Docker Desktop
PostgreSQL 15 (via Docker)

# Optional
VS Code + Extensions:
  - Prisma
  - ESLint
  - Tailwind CSS IntelliSense
```

### 8.2 Initial Setup (New Machine)

```bash
# 1. Clone repository
git clone <repository-url>
cd demo_prisma

# 2. Install dependencies
pnpm install

# 3. Setup PostgreSQL (Docker)
docker-compose up -d postgres

# 4. Configure environment variables
cp packages/prisma/.env.example packages/prisma/.env
cp apps/api/.env.example apps/api/.env
cp apps/cms/.env.example apps/cms/.env
cp apps/client/.env.example apps/client/.env

# Edit .env files with correct values
# See section 8.3 for environment variable details

# 5. Generate Prisma Client
cd packages/prisma
npx prisma generate

# 6. Run database migrations
npx prisma migrate deploy

# 7. Seed database (optional)
npx prisma db seed

# 8. Start development servers
cd ../..
pnpm dev

# Servers will start:
# - API: http://localhost:4000
# - CMS: http://localhost:3000
# - CLIENT: http://localhost:3001
```

### 8.3 Environment Variables

#### `packages/prisma/.env`
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/smart_canteen?schema=public"
```

#### `apps/api/.env`
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/smart_canteen?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=4000
NODE_ENV="development"

# Frontend URLs (for CORS)
CLIENT_URL="http://localhost:3001,http://localhost:3000"
CMS_URL="http://localhost:3000"

# AWS S3 (optional)
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="ap-southeast-1"
AWS_S3_BUCKET="smart-canteen-uploads"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

#### `apps/cms/.env` & `apps/client/.env`
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_WS_URL="http://localhost:4000"
```

### 8.4 Common Commands

```bash
# Development
pnpm dev              # Start all apps (API + CMS + CLIENT)
pnpm dev:api          # Start API only
pnpm dev:cms          # Start CMS only
pnpm dev:client       # Start CLIENT only

# Build
pnpm build            # Build all apps
pnpm build:api        # Build API only

# Database
cd packages/prisma
npx prisma studio     # Open Prisma Studio (GUI)
npx prisma migrate dev --name <name>  # Create migration
npx prisma migrate deploy             # Apply migrations
npx prisma generate   # Regenerate Prisma Client

# Docker
docker-compose up -d              # Start all containers
docker-compose down               # Stop all containers
docker-compose restart api        # Restart API container
docker-compose logs -f api        # View API logs

# Tests
pnpm test             # Run all tests
pnpm test:e2e         # Run E2E tests (API)
```

### 8.5 Docker Setup (Production-like)

```bash
# Build all Docker images
docker-compose build

# Start all services (API + PostgreSQL)
docker-compose up -d

# View logs
docker-compose logs -f api

# Access API container shell
docker exec -it smart-canteen-api sh

# Run migrations inside container
docker exec -it smart-canteen-api npx prisma migrate deploy
```

---

## 9. Key Implementation Details

### 9.1 Authentication Flow

```
1. User Login
   ├──> POST /api/auth/login
   │    Body: { email, password }
   │
   ├──> Backend verify credentials
   │    ├──> Find user by email
   │    └──> Compare password (bcrypt)
   │
   └──> Return JWT token
        {
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          user: { id, email, name, role }
        }

2. Frontend stores token
   ├──> localStorage.setItem('token', accessToken)
   └──> localStorage.setItem('user', JSON.stringify(user))

3. Subsequent requests
   ├──> HTTP: Authorization header "Bearer <token>"
   └──> WebSocket: query param ?token=<token>

4. Backend validates
   ├──> Extract token
   ├──> Verify with JWT_SECRET
   ├──> Decode payload: { sub: userId, email, role }
   └──> Attach user to request/socket
```

### 9.2 File Upload Flow (S3)

```typescript
// Frontend
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  
  return response.json(); // { url: "https://s3.amazonaws.com/..." }
};

// Backend
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  const url = await this.s3Service.uploadFile(file, 'products');
  return { url };
}

// S3Service
async uploadFile(file: Express.Multer.File, folder: string) {
  const key = `${folder}/${Date.now()}-${file.originalname}`;
  
  await this.s3Client.send(new PutObjectCommand({
    Bucket: this.bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  }));
  
  return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
}
```

### 9.3 Order Processing Flow

```
1. User adds products to cart
   ├──> Frontend: cart state (localStorage or context)
   └──> API: GET /api/cart (if persistent cart)

2. User checkout
   ├──> POST /api/orders
   │    Body: { items: [{ productId, quantity, price }], voucherId? }
   │
   ├──> Backend validates:
   │    ├──> Product availability
   │    ├──> Stock check
   │    ├──> Voucher validity
   │    └──> User wallet balance
   │
   ├──> Create order (status: PENDING)
   ├──> Deduct wallet balance
   ├──> Reduce product stock
   └──> Create notification: ORDER_CONFIRMED

3. Admin confirms order (CMS)
   ├──> PUT /api/orders/:id/confirm
   ├──> Update order status: CONFIRMED
   └──> Create notification: ORDER_READY

4. Admin completes order
   ├──> PUT /api/orders/:id/complete
   ├──> Update order status: COMPLETED
   └──> Create notification: ORDER_COMPLETED
```

### 9.4 Wallet & Top-Up Flow

```
Student Request Top-Up:
  POST /api/top-up-requests
  Body: { amount: 50000, paymentMethod: 'TRANSFER' }
  → Status: PENDING
  → Upload receipt image (S3)

Admin Reviews (CMS):
  GET /api/top-up-requests?status=PENDING
  → List all pending requests

Admin Approves:
  POST /api/top-up-requests/:id/approve
  → Update status: APPROVED
  → Increase user wallet balance
  → Create transaction record
  → Create notification: TOP_UP_APPROVED

Admin Rejects:
  POST /api/top-up-requests/:id/reject
  Body: { reason: "Invalid receipt" }
  → Update status: REJECTED
  → Create notification: TOP_UP_REJECTED
```

### 9.5 Real-time Typing Indicator Implementation

```typescript
// Frontend - debounced typing emit
const [isTyping, setIsTyping] = useState(false);
const typingTimeoutRef = useRef<NodeJS.Timeout>();

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setContent(value);
  
  // Start typing indicator
  if (!isTyping) {
    setIsTyping(true);
    socket.emit('typing:start', { roomId });
  }
  
  // Reset timeout
  clearTimeout(typingTimeoutRef.current);
  
  // Auto-stop after 3 seconds of inactivity
  typingTimeoutRef.current = setTimeout(() => {
    setIsTyping(false);
    socket.emit('typing:stop', { roomId });
  }, 3000);
};

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (isTyping) {
      socket.emit('typing:stop', { roomId });
    }
  };
}, [isTyping, roomId]);
```

---

## 10. Common Issues & Solutions

### 10.1 Database Issues

#### Problem: "Property 'room' does not exist on type 'PrismaService'"
**Cause:** Prisma Client chưa được generate sau khi thêm model mới.

**Solution:**
```bash
cd packages/prisma
npx prisma generate
# Restart API
docker-compose restart api
```

#### Problem: "Migration failed"
**Cause:** Database state không sync với schema.

**Solution:**
```bash
# DEV: Reset database (mất data!)
npx prisma migrate reset

# PROD: Debug migration
npx prisma migrate status
npx prisma migrate resolve --applied <migration_name>
```

### 10.2 WebSocket Issues

#### Problem: Socket connects nhưng không nhận notifications
**Cause:** User không join `user:${userId}` room hoặc token expired.

**Debug:**
```typescript
// Frontend
socket.on('connect', () => {
  console.log('Connected with ID:', socket.id);
});

socket.on('connection:success', (data) => {
  console.log('Authenticated:', data);
});

// Backend
// Check logs: "User joined room: { userId, room }"
```

**Solution:**
- Verify JWT token còn valid
- Check backend logs để confirm room join
- Reload page để reconnect

#### Problem: Chat messages không hiển thị
**Cause:** ChatGateway không join chat rooms hoặc event listener không attach.

**Solution:**
```typescript
// Verify event listeners
socket.on('message:new', (data) => {
  console.log('Message received:', data);
});

// Check backend
console.log('[ChatGateway] User joined rooms:', roomIds);
```

### 10.3 Frontend Issues

#### Problem: Hydration mismatch in Next.js
**Cause:** Server-rendered HTML khác với client-rendered (localStorage access).

**Solution:**
```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) {
  return <LoadingSkeleton />;
}

// Hoặc dùng suppressHydrationWarning
<div suppressHydrationWarning>
  {mounted && user?.name}
</div>
```

#### Problem: Socket không auto-reconnect
**Cause:** Reconnection config bị disable hoặc quá nhiều failed attempts.

**Solution:**
```typescript
const socket = io(apiUrl, {
  reconnection: true,
  reconnectionAttempts: 10,  // Increase attempts
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000
});
```

### 10.4 Docker Issues

#### Problem: API container crashes on startup
**Cause:** Database connection failed, port conflict, hoặc missing env vars.

**Debug:**
```bash
# View logs
docker-compose logs -f api

# Common errors:
# - "ECONNREFUSED": PostgreSQL not ready
# - "Port 4000 already in use": Kill existing process
# - "JWT_SECRET not defined": Missing .env
```

**Solution:**
```bash
# Ensure PostgreSQL started first
docker-compose up -d postgres
sleep 5
docker-compose up -d api

# Check .env files exist
ls -la apps/api/.env
```

### 10.5 TypeScript Issues

#### Problem: Import errors after adding chat models
**Cause:** VS Code TypeScript server cache cũ.

**Solution:**
```bash
# 1. Regenerate Prisma
cd packages/prisma && npx prisma generate

# 2. Restart TypeScript server
# Ctrl+Shift+P → "TypeScript: Restart TS Server"

# 3. Restart VS Code
```

---

## 11. Testing

### 11.1 Manual Testing Checklist

#### Chat System
- [ ] User có thể send message
- [ ] Message hiển thị real-time cho cả 2 users
- [ ] Typing indicator hoạt động
- [ ] Edit message
- [ ] Delete for me vs Delete for everyone
- [ ] Add/remove reaction
- [ ] Reply to message
- [ ] Mark as read (unread count giảm)
- [ ] Pagination (load older messages)

#### Notification System
- [ ] Notification bell badge count chính xác
- [ ] Click bell mở dropdown
- [ ] Click notification navigate đúng page
- [ ] Mark as read
- [ ] Mark all as read
- [ ] Browser notification hiển thị (cho phép permission)

#### Socket Connection
- [ ] Connect successful (green indicator)
- [ ] Disconnect/reconnect khi mất mạng
- [ ] Token expire handling
- [ ] Multiple tabs (同一 user) hoạt động độc lập

### 11.2 E2E Tests (TODO)

```typescript
// apps/api/test/chat/chat-websocket.e2e-spec.ts
describe('Chat WebSocket', () => {
  it('should send and receive messages', async () => {
    const client1 = io('http://localhost:4000', { query: { token: token1 } });
    const client2 = io('http://localhost:4000', { query: { token: token2 } });
    
    await waitForConnection(client1);
    await waitForConnection(client2);
    
    const messagePromise = new Promise((resolve) => {
      client2.on('message:new', resolve);
    });
    
    client1.emit('message:send', { roomId: 1, content: 'Hello' });
    
    const receivedMessage = await messagePromise;
    expect(receivedMessage.content).toBe('Hello');
  });
});
```

---

## 12. Deployment Considerations

### 12.1 Production Environment Variables

```env
# Use strong secrets
JWT_SECRET="<256-bit random string>"

# Use production database
DATABASE_URL="postgresql://user:pass@prod-db.example.com:5432/smart_canteen"

# Enable HTTPS
NODE_ENV="production"

# Configure proper CORS
CLIENT_URL="https://app.smartcanteen.vn"
CMS_URL="https://admin.smartcanteen.vn"
```

### 12.2 Database Optimizations

```sql
-- Add indexes for performance
CREATE INDEX idx_chat_message_room_created ON "ChatMessage"(roomId, createdAt DESC);
CREATE INDEX idx_notification_user_read ON "Notification"(userId, isRead);
CREATE INDEX idx_order_user_status ON "Order"(userId, status);
```

### 12.3 WebSocket Scalability

**Current limitation:** In-memory `onlineUsers` map
- Không work với multiple API instances (load balancer)
- User connect to instance A, nhưng notification emit từ instance B → không nhận được

**Solution (future):**
- Use Redis Adapter cho Socket.IO
- Store online users trong Redis
- Enable sticky sessions (session affinity) trên load balancer

```typescript
// socket.io-redis adapter
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

---

## 13. Future Enhancements

### 13.1 Chat Features (TODO)
- [ ] Group chat (>2 members)
- [ ] Voice messages
- [ ] Image/file uploads in chat
- [ ] Message search across all rooms
- [ ] Pin important messages
- [ ] Archived rooms
- [ ] Message forwarding

### 13.2 Notification Features (TODO)
- [ ] Push notifications (FCM/APNs)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Notification preferences per user
- [ ] Scheduled notifications
- [ ] Notification templates

### 13.3 System Improvements (TODO)
- [ ] Redis caching layer
- [ ] Job queue (Bull/BullMQ)
- [ ] ElasticSearch for full-text search
- [ ] Monitoring (Prometheus + Grafana)
- [ ] Logging (Winston + ELK)
- [ ] Rate limiting (per user/IP)
- [ ] API documentation (Swagger)

---

## 14. Contacts & Resources

### 14.1 Important Links

- **Repository:** (Add Git URL)
- **API Docs:** http://localhost:4000/api/docs (Swagger - TODO)
- **Staging:** (Add staging URL)
- **Production:** (Add production URL)

### 14.2 Team Contacts

- **Tech Lead:** (Add name & contact)
- **Backend Dev:** (Add name & contact)
- **Frontend Dev:** (Add name & contact)
- **DevOps:** (Add name & contact)

### 14.3 Related Documentation

- [SETUP.md](./SETUP.md) - Hướng dẫn setup ban đầu
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Docker configuration
- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Tổng quan dự án
- [REALTIME_ARCHITECTURE.md](./REALTIME_ARCHITECTURE.md) - Chi tiết WebSocket

---

## 15. Changelog

### Version 1.0 (March 24, 2026)
- ✅ Gộp chat và notification thành 1 socket duy nhất
- ✅ Fix enum imports từ @prisma/client → @smart-canteen/prisma
- ✅ Inject WebSocketsGateway vào ChatGateway
- ✅ Tài liệu hoàn chỉnh về architecture

---

**End of Documentation**

> Tài liệu này được maintain bởi team Smart Canteen. Mọi thắc mắc xin liên hệ tech lead.
