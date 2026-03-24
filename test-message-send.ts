import { PrismaClient } from '@smart-canteen/prisma';

const prisma = new PrismaClient();

async function testMessageSending() {
  console.log('\n=== Testing Message Sending to Room 1 ===\n');

  // Get room info
  const room = await prisma.room.findUnique({
    where: { id: 1 },
    include: {
      members: {
        where: { leftAt: null },
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });

  console.log('Room 1:', {
    id: room?.id,
    name: room?.name,
    type: room?.type,
    members: room?.members.map(m => ({ userId: m.userId, name: m.user.name })),
  });

  // Check recent messages
  const messages = await prisma.chatMessage.findMany({
    where: { roomId: 1 },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      content: true,
      senderId: true,
      createdAt: true,
      deletedAt: true,
      deletedFor: true,
    },
  });

  console.log('\nLast 5 messages in room 1:');
  messages.forEach(m => {
    console.log(`  - ID ${m.id}: "${m.content}" by user ${m.senderId} at ${m.createdAt}`);
    if (m.deletedAt || m.deletedFor.length > 0) {
      console.log(`    DELETED: deletedAt=${m.deletedAt}, deletedFor=${JSON.stringify(m.deletedFor)}`);
    }
  });

  // Try to create a test message
  console.log('\n=== Creating Test Message ===');
  try {
    const testMessage = await prisma.chatMessage.create({
      data: {
        roomId: 1,
        senderId: 1, // User 1
        content: 'Test message ' + new Date().toISOString(),
        contentType: 'TEXT',
      },
    });

    console.log('✅ Test message created:', {
      id: testMessage.id,
      content: testMessage.content,
      senderId: testMessage.senderId,
      createdAt: testMessage.createdAt,
    });

    // Query it back
    const retrieved = await prisma.chatMessage.findUnique({
      where: { id: testMessage.id },
    });
    console.log('✅ Message retrieved:', retrieved ? 'YES' : 'NO');

  } catch (error) {
    console.error('❌ Error creating test message:', error);
  }

  await prisma.$disconnect();
}

testMessageSending().catch(console.error);
