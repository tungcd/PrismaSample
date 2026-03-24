import { PrismaClient } from '@smart-canteen/prisma';

const prisma = new PrismaClient();

async function debugChat() {
  console.log('=== DEBUGGING CHAT SYSTEM ===\n');

  // 1. Check all rooms
  console.log('1. ALL ROOMS:');
  const rooms = await prisma.room.findMany({
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, role: true }
          }
        }
      },
      _count: {
        select: { messages: true }
      }
    }
  });
  
  console.log(`Found ${rooms.length} rooms:`);
  rooms.forEach(room => {
    console.log(`\n  Room #${room.id} (${room.type})`);
    console.log(`    Name: ${room.name || 'N/A'}`);
    console.log(`    Messages: ${room._count.messages}`);
    console.log(`    Last message: ${room.lastMessageAt || 'none'}`);
    console.log(`    Members:`);
    room.members.forEach(m => {
      console.log(`      - ${m.user.name} (${m.user.role}) - unread: ${m.unreadCount}`);
    });
  });

  // 2. Check all messages
  console.log('\n\n2. RECENT MESSAGES:');
  const messages = await prisma.chatMessage.findMany({
    where: { deletedAt: null },
    include: {
      sender: {
        select: { id: true, name: true, role: true }
      },
      room: {
        select: { id: true, type: true, name: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log(`Found ${messages.length} recent messages:`);
  messages.forEach(msg => {
    console.log(`\n  Message #${msg.id}`);
    console.log(`    Room: #${msg.room.id} (${msg.room.type})`);
    console.log(`    From: ${msg.sender.name} (${msg.sender.role})`);
    console.log(`    Content: "${msg.content.substring(0, 50)}..."`);
    console.log(`    Time: ${msg.createdAt}`);
  });

  // 3. Check which users can see which rooms
  console.log('\n\n3. USER-ROOM ACCESS:');
  const users = await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'PARENT'] }
    },
    select: { id: true, name: true, role: true }
  });

  for (const user of users) {
    const userRooms = await prisma.room.findMany({
      where: {
        isActive: true,
        members: {
          some: {
            userId: user.id,
            leftAt: null
          }
        }
      },
      select: {
        id: true,
        type: true,
        name: true,
        _count: {
          select: { messages: true }
        }
      }
    });

    console.log(`\n  ${user.name} (${user.role}) can access ${userRooms.length} rooms:`);
    userRooms.forEach(room => {
      console.log(`    - Room #${room.id} (${room.type}) - ${room._count.messages} messages`);
    });
  }

  await prisma.$disconnect();
}

debugChat().catch(console.error);
