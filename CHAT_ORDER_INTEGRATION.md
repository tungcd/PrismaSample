# Chat Integration cho Order Confirmation

## Architecture Overview

### Current Systems

1. **OLD Chat System** (Conversation/Message) - For CMS Support
   - ✅ Already in database schema
   - ✅ Designed for ADMIN ↔ PARENT/STUDENT communication
   - ✅ Supports ORDER_QUERY type
   - ❌ No WebSocket (REST only)
   - ❌ No UI implemented yet

2. **NEW Chat System** (Room/ChatMessage) - For Client P2P
   - ✅ Full WebSocket support
   - ✅ Complete UI (chat-list, chat-room, etc.)
   - ✅ Currently in CLIENT app only
   - ❌ Not integrated with CMS
   - ❌ Designed for PARENT/STUDENT peer-to-peer

---

## Option 1: Use Conversation System (Recommended for Orders)

### Why This Option?
- **Already designed for CMS-Client communication**
- **Has ORDER_QUERY conversation type**
- **Simpler to implement (no WebSocket needed initially)**
- **Staff-assigned system (adminId field)**

### Implementation Steps

#### 1. Backend API (apps/api)

**Create `apps/api/src/conversation/conversation.module.ts`:**

```typescript
import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
```

**Create `apps/api/src/conversation/conversation.service.ts`:**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationType } from '@smart-canteen/prisma';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  // Get all conversations (for CMS dashboard)
  async getConversations(adminId?: number, isActive = true) {
    return this.prisma.conversation.findMany({
      where: {
        ...(adminId && { adminId }),
        isActive,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        admin: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  // Get conversation by ID
  async getConversation(conversationId: number) {
    return this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user: true,
        admin: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    });
  }

  // Create conversation for order query
  async createOrderConversation(userId: number, orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) throw new Error('Order not found');

    // Check if conversation already exists
    const existing = await this.prisma.conversation.findFirst({
      where: {
        userId,
        type: 'ORDER_QUERY',
        isActive: true,
      },
    });

    if (existing) return existing;

    // Create new conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        type: 'ORDER_QUERY',
        title: `Order #${order.orderNumber}`,
        userId,
        lastMessagePreview: `Order confirmation needed`,
        lastMessageAt: new Date(),
      },
    });

    // Create system message
    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        content: `Order #${order.orderNumber} needs confirmation.\nTotal: ${order.total} VND\nItems: ${order.items.length}`,
        isSystemMessage: true,
        metadata: { orderId, orderNumber: order.orderNumber },
      },
    });

    return conversation;
  }

  // Send message
  async sendMessage(conversationId: number, senderId: number, content: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) throw new Error('Conversation not found');

    // Determine if sender is admin
    const isAdmin = senderId === conversation.adminId;

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Update conversation
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: content.substring(0, 100),
        unreadCountUser: isAdmin
          ? { increment: 1 }
          : conversation.unreadCountUser,
        unreadCountAdmin: !isAdmin
          ? { increment: 1 }
          : conversation.unreadCountAdmin,
      },
    });

    return message;
  }

  // Assign admin to conversation
  async assignAdmin(conversationId: number, adminId: number) {
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { adminId },
    });
  }

  // Mark as read
  async markAsRead(conversationId: number, userId: number) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    const isAdmin = userId === conversation.adminId;

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        ...(isAdmin
          ? { unreadCountAdmin: 0 }
          : { unreadCountUser: 0 }),
      },
    });

    // Mark messages as read
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
}
```

**Create `apps/api/src/conversation/conversation.controller.ts`:**

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  /**
   * GET /conversations - Get all conversations
   * Client: Shows own conversations
   * CMS: Shows assigned conversations (or all if admin)
   */
  @Get()
  async getConversations(@Req() req, @Query('active') active?: string) {
    const user = req.user;
    const isActive = active === 'false' ? false : true;

    // If PARENT/STUDENT, only show their conversations
    if (user.role === 'PARENT' || user.role === 'STUDENT') {
      return this.prismaService.conversation.findMany({
        where: { userId: user.id, isActive },
        include: {
          admin: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      });
    }

    // If ADMIN/STAFF, show assigned or all
    return this.conversationService.getConversations(
      user.role === 'STAFF' ? user.id : undefined,
      isActive,
    );
  }

  /**
   * GET /conversations/:id - Get conversation with messages
   */
  @Get(':id')
  async getConversation(@Param('id') id: string) {
    return this.conversationService.getConversation(parseInt(id));
  }

  /**
   * POST /conversations/order - Create conversation for order
   */
  @Post('order')
  async createOrderConversation(
    @Req() req,
    @Body() body: { orderId: number },
  ) {
    return this.conversationService.createOrderConversation(
      req.user.id,
      body.orderId,
    );
  }

  /**
   * POST /conversations/:id/messages - Send message
   */
  @Post(':id/messages')
  async sendMessage(
    @Req() req,
    @Param('id') id: string,
    @Body() body: { content: string },
  ) {
    return this.conversationService.sendMessage(
      parseInt(id),
      req.user.id,
      body.content,
    );
  }

  /**
   * PATCH /conversations/:id/assign - Assign admin (CMS only)
   */
  @Patch(':id/assign')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'MANAGER')
  async assignAdmin(
    @Param('id') id: string,
    @Body() body: { adminId: number },
  ) {
    return this.conversationService.assignAdmin(parseInt(id), body.adminId);
  }

  /**
   * POST /conversations/:id/read - Mark as read
   */
  @Post(':id/read')
  async markAsRead(@Req() req, @Param('id') id: string) {
    return this.conversationService.markAsRead(parseInt(id), req.user.id);
  }
}
```

#### 2. CMS Frontend (apps/cms)

**Create `apps/cms/src/app/dashboard/support/page.tsx`:**

```typescript
"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Conversation {
  id: number;
  type: string;
  title: string;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  admin?: {
    id: number;
    name: string;
  };
  unreadCountAdmin: number;
  lastMessageAt: string;
  lastMessagePreview: string;
}

export default function SupportPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const res = await fetch("/api/v1/conversations", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    setConversations(data);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Support Conversations</h1>

      <div className="grid grid-cols-12 gap-4">
        {/* Conversation List */}
        <div className="col-span-4 border rounded-lg p-4 space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                selectedId === conv.id ? "bg-blue-50 border-blue-500" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{conv.user.name}</p>
                  <p className="text-sm text-gray-600">{conv.title}</p>
                </div>
                {conv.unreadCountAdmin > 0 && (
                  <Badge variant="destructive">{conv.unreadCountAdmin}</Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2 truncate">
                {conv.lastMessagePreview}
              </p>
            </div>
          ))}
        </div>

        {/* Chat Panel */}
        <div className="col-span-8 border rounded-lg">
          {selectedId ? (
            <ConversationChat conversationId={selectedId} />
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-400">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationChat({ conversationId }: { conversationId: number }) {
  // Implement chat UI similar to client chat-room component
  return <div>Chat for conversation {conversationId}</div>;
}
```

#### 3. Client Integration

**Create order confirmation with chat:**

```typescript
// In apps/client/src/app/(parent)/orders/[id]/page.tsx
async function confirmOrder(orderId: number) {
  // 1. Create conversation
  const conv = await fetch("/api/v1/conversations/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId }),
  }).then((r) => r.json());

  // 2. Redirect to chat
  router.push(`/support/${conv.id}`);
}
```

---

## Option 2: Extend New Chat System to CMS

### Why This Option?
- **Modern WebSocket real-time experience**
- **Reuse existing chat UI components**
- **Better for ongoing conversations**

### Implementation

Simply copy the client chat infrastructure to CMS:

1. Copy `apps/client/src/lib/chat-socket.tsx` → `apps/cms/src/lib/`
2. Copy `apps/client/src/lib/hooks/use-chat.ts` → `apps/cms/src/lib/hooks/`
3. Copy `apps/client/src/components/chat/*` → `apps/cms/src/components/chat/`
4. Create `apps/cms/src/app/dashboard/chat/page.tsx`
5. Add `<ChatSocketProvider>` to CMS layout

**Filter users in CMS chat:**

```typescript
// In getAvailableUsers - allow ADMIN/STAFF to see PARENT/STUDENT
async getAvailableUsers(currentUserId: number) {
  const currentUser = await this.prisma.user.findUnique({
    where: { id: currentUserId },
  });

  // If ADMIN/STAFF, show PARENT/STUDENT users
  if (['ADMIN', 'MANAGER', 'STAFF'].includes(currentUser.role)) {
    return this.prisma.user.findMany({
      where: {
        role: { in: ['PARENT', 'STUDENT'] },
      },
      // ...
    });
  }

  // If PARENT/STUDENT, show ADMIN/STAFF
  return this.prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'MANAGER', 'STAFF'] },
    },
    // ...
  });
}
```

---

## Recommendation

**For Order Confirmation specifically:**
→ Use **Option 1** (Conversation system)
- Simpler to implement
- Designed for staff-client communication
- Has ORDER_QUERY type built-in
- Can integrate with order approval workflow

**For General Chat:**
→ Use **Option 2** (New Chat system)
- Better real-time experience
- More modern UI
- Can be used for any communication

**Best of Both Worlds:**
- Keep Conversation system for order-related support
- Use new Chat system for general parent-student chat
- They can coexist in the same app
