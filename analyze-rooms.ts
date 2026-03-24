import { PrismaClient } from '@smart-canteen/prisma';

const prisma = new PrismaClient();

async function analyzeRooms() {
  console.log('\n=== Analyzing All DIRECT Rooms ===\n');

  const rooms = await prisma.room.findMany({
    where: {
      type: 'DIRECT',
      isActive: true,
    },
    include: {
      members: {
        where: { leftAt: null },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          content: true,
          senderId: true,
          createdAt: true,
        },
      },
    },
    orderBy: { id: 'asc' },
  });

  console.log(`Found ${rooms.length} DIRECT rooms:\n`);

  rooms.forEach(room => {
    console.log(`Room ${room.id}:`);
    console.log(`  Members: ${room.members.map(m => `${m.user.name} (ID: ${m.userId})`).join(' <-> ')}`);
    console.log(`  Total messages: ${room.messages.length > 0 ? 'Has messages' : 'Empty'}`);
    if (room.messages.length > 0) {
      console.log(`  Last message: "${room.messages[0].content}" by user ${room.messages[0].senderId}`);
    }
    console.log('');
  });

  // Specific check for userId 1 (ADMIN)
  console.log('\n=== Rooms involving User 1 (ADMIN) ===\n');
  const adminRooms = rooms.filter(r => 
    r.members.some(m => m.userId === 1)
  );

  if (adminRooms.length > 0) {
    adminRooms.forEach(r => {
      const otherMember = r.members.find(m => m.userId !== 1);
      console.log(`Room ${r.id}: ADMIN <-> ${otherMember?.user.name} (ID: ${otherMember?.userId})`);
    });
  } else {
    console.log('ADMIN has no DIRECT rooms as member');
  }

  // Specific check for userId 4
  console.log('\n=== Rooms involving User 4 (Vũ Hữu Bảo) ===\n');
  const user4Rooms = rooms.filter(r => 
    r.members.some(m => m.userId === 4)
  );

  if (user4Rooms.length > 0) {
    user4Rooms.forEach(r => {
      const otherMember = r.members.find(m => m.userId !== 4);
      console.log(`Room ${r.id}: User 4 <-> ${otherMember?.user.name} (ID: ${otherMember?.userId})`);
    });
  }

  // Test findDirectRoom logic
  console.log('\n=== Testing findDirectRoom(1, 4) ===\n');
  
  const testRooms = rooms.filter(room => {
    const memberIds = room.members.map(m => m.userId);
    // Check if EVERY member is in [1, 4]
    const allMembersMatch = memberIds.every(id => [1, 4].includes(id));
    // Check if exactly 2 members
    const exactlyTwo = memberIds.length === 2;
    return allMembersMatch && exactlyTwo;
  });

  if (testRooms.length > 0) {
    console.log('Would return room:', testRooms.map(r => ({
      id: r.id,
      memberIds: r.members.map(m => m.userId),
    })));
  } else {
    console.log('Would return: null (no matching room)');
    console.log('This means a NEW room would be created between User 1 and User 4');
  }

  await prisma.$disconnect();
}

analyzeRooms().catch(console.error);
