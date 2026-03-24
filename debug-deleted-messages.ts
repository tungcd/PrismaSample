import { PrismaClient } from '@smart-canteen/prisma';

const prisma = new PrismaClient();

async function checkDeletedMessages() {
  console.log('\n=== Checking Deleted Messages in Room 1 ===\n');

  // Get all messages in room 1 (including deleted)
  const allMessages = await prisma.chatMessage.findMany({
    where: { roomId: 1 },
    select: {
      id: true,
      content: true,
      deletedAt: true,
      deletedFor: true,
      senderId: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Total messages in room 1: ${allMessages.length}\n`);

  // Messages deleted globally
  const globallyDeleted = allMessages.filter(m => m.deletedAt !== null);
  console.log(`Globally deleted (deletedAt != null): ${globallyDeleted.length}`);
  globallyDeleted.forEach(m => {
    console.log(`  - ID ${m.id}: deletedAt=${m.deletedAt}, deletedFor=${JSON.stringify(m.deletedFor)}`);
  });

  // Messages deleted for specific users
  const deletedForSomeone = allMessages.filter(m => m.deletedFor.length > 0);
  console.log(`\nDeleted for specific users (deletedFor not empty): ${deletedForSomeone.length}`);
  deletedForSomeone.forEach(m => {
    console.log(`  - ID ${m.id}: deletedFor=${JSON.stringify(m.deletedFor)}, senderId=${m.senderId}`);
  });

  // Messages visible to user  (example userId = 1)
  const userId = 1;
  const visibleToUser = allMessages.filter(m => 
    m.deletedAt === null && !m.deletedFor.includes(userId)
  );
  console.log(`\nVisible to userId ${userId}: ${visibleToUser.length}`);

  // Get user IDs in room 1
  const members = await prisma.roomMember.findMany({
    where: { roomId: 1, leftAt: null },
    select: { userId: true },
  });
  console.log(`\nRoom 1 members: ${members.map(m => m.userId).join(', ')}`);

  await prisma.$disconnect();
}

checkDeletedMessages().catch(console.error);
