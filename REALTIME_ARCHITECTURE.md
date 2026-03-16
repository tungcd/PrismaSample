# 🔔 Real-time Notification & Chat Architecture

## 📊 Current State Analysis

### ✅ Đã có:

- **Notification Model**: Đã có trong DB với fields (id, userId, type, title, message, isRead, metadata, createdAt)
- **REST API**: GET, PATCH, DELETE endpoints cho notifications
- **Authentication**: JWT + Roles guard đã setup
- **Infrastructure**: PostgreSQL + Redis + NestJS + Next.js

### ❌ Thiếu:

- **Real-time delivery**: Không có WebSocket/SSE
- **Push notifications**: Chỉ có polling
- **Chat system**: Chưa có bất kỳ model/logic nào
- **Read receipts**: Không track delivery status
- **Presence system**: Không track online/offline users

---

## 🎯 Proposed Architecture: **Socket.IO + REST API Hybrid**

### 📌 **Recommendation: Use Socket.IO**

**Lý do chọn Socket.IO thay vì REST API polling:**

| Feature            | REST API (Polling)          | Socket.IO                      | Winner    |
| ------------------ | --------------------------- | ------------------------------ | --------- |
| **Real-time**      | ❌ Delay 5-30s              | ✅ Instant (<100ms)            | Socket.IO |
| **Server Load**    | ❌ High (constant requests) | ✅ Low (persistent connection) | Socket.IO |
| **Battery/Data**   | ❌ Drains (mobile)          | ✅ Efficient                   | Socket.IO |
| **Bi-directional** | ❌ One-way                  | ✅ Two-way                     | Socket.IO |
| **Chat Support**   | ❌ Poor UX                  | ✅ Perfect                     | Socket.IO |
| **Complexity**     | ✅ Simple                   | ⚠️ Medium                      | REST      |
| **Fallback**       | N/A                         | ✅ Auto (long-polling)         | Socket.IO |

**Kết luận:** Socket.IO thắng 6/7, chỉ thua về độ phức tạp nhưng có thể manage được.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Smart Canteen System                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   CMS        │         │   API        │         │   Client     │
│   (Admin)    │◄───────►│   Server     │◄───────►│   (Parent)   │
│              │         │              │         │              │
│  Next.js     │         │  NestJS      │         │  Next.js     │
│  Socket.IO   │         │  Socket.IO   │         │  Socket.IO   │
│  Client      │         │  Gateway     │         │  Client      │
└──────────────┘         └──────────────┘         └──────────────┘
                                │
                                ├── PostgreSQL (Notifications, Messages)
                                ├── Redis (Presence, Message Queue)
                                └── Redis Pub/Sub (Multi-instance)

Flow:
1. CMS/Client connects → Socket.IO Gateway → Authenticate via JWT
2. Join rooms: user:{userId}, role:{role}, admin-chat, support-chat
3. Events: notification:new, message:new, order:update, etc.
4. Persistence: Save to DB → Broadcast via Socket → Delivery confirmation
```

---

## 📦 Database Schema Additions

### 1. **Notification Enhancements** (Update existing model)

```prisma
model Notification {
  id        Int                @id @default(autoincrement())
  userId    Int
  type      NotificationType
  title     String
  message   String
  data      Json?              // Extra data (orderId, amount, etc.)
  isRead    Boolean           @default(false)

  // Real-time tracking
  deliveredAt  DateTime?      // ✨ NEW: When pushed via socket
  readAt       DateTime?      // ✨ NEW: When user actually read
  deliveryStatus DeliveryStatus @default(PENDING) // ✨ NEW

  // Categorization
  priority  NotificationPriority @default(NORMAL) // ✨ NEW
  actionUrl String?            // ✨ NEW: Link to relevant page

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@index([userId, deliveryStatus])
  @@index([createdAt])
}

enum NotificationType {
  ORDER_CONFIRMED      // Order was confirmed
  ORDER_READY          // Order is ready for pickup
  ORDER_COMPLETED      // Order completed
  ORDER_CANCELLED      // Order cancelled
  PAYMENT_SUCCESS      // Payment successful
  PAYMENT_FAILED       // Payment failed
  TOP_UP_APPROVED      // Top-up request approved
  TOP_UP_REJECTED      // Top-up request rejected
  LOW_BALANCE          // Wallet balance low
  SPENDING_LIMIT       // Student reached spending limit
  PRODUCT_AVAILABLE    // Out-of-stock product available
  PROMOTION            // Promotion/voucher
  SYSTEM_ANNOUNCEMENT  // System announcement
  CHAT_MESSAGE         // ✨ NEW: New chat message
}

enum DeliveryStatus {
  PENDING      // Created but not sent
  DELIVERED    // Pushed via socket
  FAILED       // Failed to deliver
  READ         // User read it
}

enum NotificationPriority {
  LOW          // Can be batched
  NORMAL       // Standard delivery
  HIGH         // Show immediately
  URGENT       // Alert + sound
}
```

### 2. **Chat System** (New models)

```prisma
// Conversations between users
model Conversation {
  id          Int      @id @default(autoincrement())
  type        ConversationType @default(SUPPORT)
  title       String?  // Optional conversation title
  isActive    Boolean  @default(true)

  // Participants
  userId      Int      // Parent/Student
  adminId     Int?     // Admin/Manager/Staff (if assigned)

  // Metadata
  lastMessageAt DateTime?
  lastMessagePreview String? // Last 100 chars
  unreadCountUser  Int @default(0) // Unread by user
  unreadCountAdmin Int @default(0) // Unread by admin

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  closedAt  DateTime? // When conversation was closed

  user     User  @relation("UserConversations", fields: [userId], references: [id])
  admin    User? @relation("AdminConversations", fields: [adminId], references: [id])
  messages Message[]

  @@index([userId, isActive])
  @@index([adminId, isActive])
  @@index([lastMessageAt])
}

enum ConversationType {
  SUPPORT      // General support
  ORDER_QUERY  // About specific order
  PAYMENT      // Payment issues
  PRODUCT      // Product questions
  COMPLAINT    // Complaints
  FEEDBACK     // Feedback
}

// Messages in conversations
model Message {
  id             Int      @id @default(autoincrement())
  conversationId Int
  senderId       Int      // Who sent (user or admin)
  content        String   @db.Text
  attachments    String[] // Image URLs

  // Status tracking
  isRead         Boolean  @default(false)
  readAt         DateTime?
  deliveredAt    DateTime?

  // Metadata
  isSystemMessage Boolean @default(false) // "Admin joined", "Order #123 link"
  metadata        Json?    // Extra data

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? // Soft delete

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender       User         @relation(fields: [senderId], references: [id])

  @@index([conversationId, createdAt])
  @@index([senderId])
}

// Add to User model relations:
// conversations_as_user  Conversation[] @relation("UserConversations")
// conversations_as_admin Conversation[] @relation("AdminConversations")
// messages               Message[]
```

---

## 🔧 Implementation Plan

### **Phase 1: Setup Socket.IO Infrastructure** (Day 1-2)

#### API (NestJS)

```bash
pnpm --filter=@smart-canteen/api add @nestjs/websockets @nestjs/platform-socket.io socket.io
```

**Files to create:**

```
apps/api/src/
├── websockets/
│   ├── websockets.module.ts
│   ├── websockets.gateway.ts       # Main Socket.IO gateway
│   ├── guards/
│   │   └── ws-jwt.guard.ts         # JWT auth for sockets
│   ├── adapters/
│   │   └── redis-io.adapter.ts     # Redis adapter (multi-instance)
│   └── events/
│       ├── notification.events.ts   # Notification events
│       └── chat.events.ts          # Chat events
```

**Key Features:**

- JWT authentication on connection
- Room management (user rooms, admin rooms)
- Redis adapter for horizontal scaling
- Event emitters for notifications

#### CMS & Client (Next.js)

```bash
pnpm --filter=@smart-canteen/cms add socket.io-client
pnpm --filter=@smart-canteen/client add socket.io-client
```

**Files to create:**

```
apps/cms/src/
├── lib/
│   ├── socket.ts                   # Socket.IO client singleton
│   └── realtime-context.tsx       # React context for socket
├── hooks/
│   ├── use-notifications.ts       # Hook for notifications
│   └── use-chat.ts                # Hook for chat
└── components/
    ├── notification-bell.tsx      # Bell icon with badge
    ├── notification-list.tsx      # Dropdown list
    └── chat-widget.tsx            # Chat popup

apps/client/src/ (same structure)
```

---

### **Phase 2: Real-time Notifications** (Day 3-4)

#### Backend Implementation

**1. Notification Service Enhancement**

```typescript
// apps/api/src/notifications/notifications.service.ts

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2, // Add event emitter
  ) {}

  async create(userId: number, data: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        ...data,
        deliveryStatus: "PENDING",
      },
    });

    // Emit event for Socket.IO gateway to broadcast
    this.eventEmitter.emit("notification.created", {
      userId,
      notification,
    });

    return notification;
  }

  // Batch notifications (e.g., all parents)
  async createBatch(
    userIds: number[],
    data: Omit<CreateNotificationDto, "userId">,
  ) {
    const notifications = await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        ...data,
        deliveryStatus: "PENDING",
      })),
    });

    this.eventEmitter.emit("notification.batch", {
      userIds,
      notification: data,
    });

    return notifications;
  }
}
```

**2. Socket.IO Gateway**

```typescript
// apps/api/src/websockets/websockets.gateway.ts

@WebSocketGateway({
  cors: { origin: ["http://localhost:3000", "http://localhost:3001"] },
  namespace: "/realtime",
})
export class WebsocketsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private notificationService: NotificationsService) {}

  // Client connects
  @UseGuards(WsJwtGuard)
  async handleConnection(@ConnectedSocket() client: Socket) {
    const user = client.data.user; // From JWT guard

    // Join user-specific room
    client.join(`user:${user.id}`);
    client.join(`role:${user.role}`);

    console.log(`User ${user.id} connected`);
  }

  // Listen for notification.created event
  @OnEvent("notification.created")
  async handleNotificationCreated(payload: {
    userId: number;
    notification: any;
  }) {
    // Send to specific user
    this.server
      .to(`user:${payload.userId}`)
      .emit("notification:new", payload.notification);

    // Update delivery status
    await this.notificationService.markDelivered(payload.notification.id);
  }

  // Client marks notification as read
  @SubscribeMessage("notification:read")
  async handleMarkRead(
    @MessageBody() data: { id: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.id;
    await this.notificationService.markRead(data.id, userId);
    return { success: true };
  }
}
```

#### Frontend Implementation (Client/CMS)

**1. Socket Connection Hook**

```typescript
// apps/client/src/hooks/use-realtime.ts

export function useRealtime() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.accessToken) return;

    const newSocket = io("http://localhost:4000/realtime", {
      auth: { token: session.accessToken },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to realtime server");
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [session?.accessToken]);

  return socket;
}
```

**2. Notifications Hook**

```typescript
// apps/client/src/hooks/use-notifications.ts

export function useNotifications() {
  const socket = useRealtime();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!socket) return;

    // Listen for new notifications
    socket.on("notification:new", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast
      toast.success(notification.title, {
        description: notification.message,
      });

      // Play sound (optional)
      new Audio("/notification.mp3").play();
    });

    return () => {
      socket.off("notification:new");
    };
  }, [socket]);

  const markAsRead = async (id: number) => {
    socket?.emit("notification:read", { id });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return { notifications, unreadCount, markAsRead };
}
```

**3. Notification Bell Component**

```tsx
// apps/client/src/components/notification-bell.tsx

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h3 className="font-semibold">Thông báo ({unreadCount})</h3>
          {notifications.slice(0, 5).map((notif) => (
            <div
              key={notif.id}
              className={cn(
                "p-2 rounded hover:bg-accent cursor-pointer",
                !notif.isRead && "bg-blue-50",
              )}
              onClick={() => markAsRead(notif.id)}
            >
              <p className="font-medium text-sm">{notif.title}</p>
              <p className="text-xs text-muted-foreground">{notif.message}</p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

---

### **Phase 3: Chat System** (Day 5-7)

#### Backend Implementation

**1. Conversations Module**

```typescript
// apps/api/src/conversations/conversations.service.ts

@Injectable()
export class ConversationsService {
  async createOrGetConversation(userId: number, type: ConversationType) {
    // Check if user has active conversation
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { userId, type },
      });
    }

    return conversation;
  }

  async sendMessage(conversationId: number, senderId: number, content: string) {
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    });

    // Update conversation
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: content.substring(0, 100),
      },
    });

    // Emit event for Socket.IO
    this.eventEmitter.emit("message.sent", {
      conversationId,
      message,
    });

    return message;
  }
}
```

**2. Socket.IO Chat Events**

```typescript
// apps/api/src/websockets/websockets.gateway.ts

@SubscribeMessage('chat:join')
async handleJoinChat(
  @MessageBody() data: { conversationId: number },
  @ConnectedSocket() client: Socket,
) {
  client.join(`chat:${data.conversationId}`);
  return { success: true };
}

@SubscribeMessage('chat:send')
async handleSendMessage(
  @MessageBody() data: { conversationId: number; content: string },
  @ConnectedSocket() client: Socket,
) {
  const userId = client.data.user.id;
  const message = await this.conversationsService.sendMessage(
    data.conversationId,
    userId,
    data.content,
  );
  return message;
}

@OnEvent('message.sent')
async handleMessageSent(payload: { conversationId: number; message: any }) {
  // Broadcast to all participants in this conversation
  this.server.to(`chat:${payload.conversationId}`).emit('message:new', payload.message);
}

@SubscribeMessage('chat:typing')
handleTyping(
  @MessageBody() data: { conversationId: number; isTyping: boolean },
  @ConnectedSocket() client: Socket,
) {
  const userId = client.data.user.id;
  // Broadcast typing indicator to others in conversation
  client.to(`chat:${data.conversationId}`).emit('user:typing', {
    userId,
    isTyping: data.isTyping,
  });
}
```

#### Frontend Implementation

**1. Chat Hook**

```typescript
// apps/client/src/hooks/use-chat.ts

export function useChat(conversationId: number | null) {
  const socket = useRealtime();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join conversation room
    socket.emit("chat:join", { conversationId });

    // Listen for new messages
    socket.on("message:new", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for typing indicator
    socket.on("user:typing", (data: { userId: number; isTyping: boolean }) => {
      setIsTyping(data.isTyping);
    });

    return () => {
      socket.off("message:new");
      socket.off("user:typing");
    };
  }, [socket, conversationId]);

  const sendMessage = async (content: string) => {
    if (!socket || !conversationId) return;

    const message = await socket.emitWithAck("chat:send", {
      conversationId,
      content,
    });

    return message;
  };

  const sendTypingIndicator = (isTyping: boolean) => {
    socket?.emit("chat:typing", { conversationId, isTyping });
  };

  return { messages, sendMessage, isTyping, sendTypingIndicator };
}
```

**2. Chat Widget Component**

```tsx
// apps/client/src/components/chat-widget.tsx

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const { messages, sendMessage, isTyping, sendTypingIndicator } =
    useChat(conversationId);

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  return (
    <>
      {/* Floating button */}
      <Button
        className="fixed bottom-4 right-4 rounded-full h-14 w-14"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Chat với Admin</DialogTitle>
          </DialogHeader>

          {/* Messages list */}
          <ScrollArea className="flex-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "mb-2 p-2 rounded",
                  msg.senderId === currentUserId
                    ? "bg-blue-100 ml-auto"
                    : "bg-gray-100",
                )}
              >
                <p className="text-sm">{msg.content}</p>
                <span className="text-xs text-gray-500">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            ))}
            {isTyping && (
              <p className="text-xs text-gray-500">Admin đang nhập...</p>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Nhập tin nhắn..."
              onFocus={() => sendTypingIndicator(true)}
              onBlur={() => sendTypingIndicator(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend(e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
            />
            <Button>Gửi</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## 🔐 Security Considerations

1. **Authentication**: JWT token in Socket.IO handshake
2. **Authorization**: Room-based access control (users can only join their own rooms)
3. **Rate Limiting**: Limit messages per second per user
4. **Message Validation**: Sanitize content, check length, filter profanity
5. **File Uploads**: Validate file types, scan for viruses
6. **CORS**: Whitelist only CMS and Client origins

---

## 📈 Scalability

### Redis Adapter for Multi-instance

```typescript
// apps/api/src/websockets/adapters/redis-io.adapter.ts

import { IoAdapter } from "@nestjs/platform-socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

export class RedisIoAdapter extends IoAdapter {
  async connectToRedis() {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    return createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);
    const adapter = await this.connectToRedis();
    server.adapter(adapter);
    return server;
  }
}
```

### Load Balancing

- Multiple API instances behind load balancer
- Redis Pub/Sub to sync messages across instances
- Session affinity not required (Redis adapter handles it)

---

## 📊 Monitoring & Analytics

1. **Metrics to track**:
   - Active socket connections
   - Messages sent/received per second
   - Average delivery time
   - Failed deliveries
   - Chat response time (admin → user)

2. **Tools**:
   - Prometheus + Grafana for metrics
   - Sentry for error tracking
   - Custom dashboard in CMS

---

## 🚀 Migration Strategy

### Step-by-step rollout:

1. **Week 1**: Deploy notification infrastructure (no breaking changes)
2. **Week 2**: Migrate existing notification consumers to use sockets
3. **Week 3**: Enable chat for beta users (parents who opt-in)
4. **Week 4**: Full rollout + monitoring

### Backwards compatibility:

- Keep REST API for notifications (for mobile apps without sockets)
- Graceful degradation: If socket fails, fall back to polling

---

## ✅ Summary: Go with Socket.IO!

**Pros:**

- ✅ Real-time (instant delivery)
- ✅ Efficient (persistent connection)
- ✅ Perfect for chat
- ✅ Auto fallback to long-polling
- ✅ Battle-tested (used by Slack, Trello, etc.)

**Cons:**

- ⚠️ More complex than REST
- ⚠️ Need Redis for scaling
- ⚠️ DevOps overhead (monitoring connections)

**Verdict:** Socket.IO is the right choice for this use case. The benefits far outweigh the complexity.

---

## 📝 Next Steps

**Muốn tôi implement luôn không?**

Option A: Implement Phase 1 (Setup) ngay
Option B: Review file structure và confirm trước
Option C: Chỉ cần tạo migrations + schema first

Bạn chọn gì? 🚀
