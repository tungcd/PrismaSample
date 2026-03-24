import { PrismaClient } from '@smart-canteen/prisma';

const prisma = new PrismaClient();

async function debugRoomCreation() {
  console.log('\n=== Debug Room Creation Issue ===\n');

  // Check if there are duplicate DIRECT rooms between same users
  const allDirectRooms = await prisma.room.findMany({
    where: {
      type: 'DIRECT',
      isActive: true,
    },
    include: {
      members: {
        where: { leftAt: null },
        select: { userId: true },
      },
    },
    orderBy: { id: 'asc' },
  });

  console.log(`Total DIRECT rooms: ${allDirectRooms.length}\n`);

  // Group by member pairs
  const roomsByMembers = new Map<string, number[]>();
  
  allDirectRooms.forEach(room => {
    const memberIds = room.members.map(m => m.userId).sort();
    const key = memberIds.join('-');
    
    if (!roomsByMembers.has(key)) {
      roomsByMembers.set(key, []);
    }
    roomsByMembers.get(key)!.push(room.id);
  });

  console.log('=== Checking for duplicate rooms ===\n');
  let hasDuplicates = false;
  
  for (const [memberKey, roomIds] of roomsByMembers.entries()) {
    if (roomIds.length > 1) {
      hasDuplicates = true;
      console.log(`❌ DUPLICATE ROOMS for members [${memberKey}]:`);
      console.log(`   Room IDs: ${roomIds.join(', ')}`);
      
      // Show message count in each
      for (const roomId of roomIds) {
        const msgCount = await prisma.chatMessage.count({
          where: { roomId },
        });
        console.log(`   - Room ${roomId}: ${msgCount} messages`);
      }
      console.log('');
    }
  }

  if (!hasDuplicates) {
    console.log('✅ No duplicate rooms found\n');
  }

  // Test specific case: User 1 (ADMIN) trying to chat with User 4
  console.log('\n=== Test: ADMIN (User 1) → User 4 ===\n');
  
  const user1 = await prisma.user.findUnique({
    where: { id: 1 },
    select: { id: true, name: true, email: true, role: true },
  });

  const user4 = await prisma.user.findUnique({
    where: { id: 4 },
    select: { id: true, name: true, email: true, role: true },
  });

  console.log(`User 1: ${user1?.name} (${user1?.role})`);
  console.log(`User 4: ${user4?.name}`);

  // Check what rooms match [1, 4]
  const matchingRooms = allDirectRooms.filter(room => {
    const memberIds = room.members.map(m => m.userId).sort();
    return memberIds.length === 2 && 
           memberIds.includes(1) && 
           memberIds.includes(4);
  });

  if (matchingRooms.length > 0) {
    console.log(`\nExisting room(s) between User 1 and User 4:`);
    matchingRooms.forEach(room => {
      console.log(`  - Room ${room.id}`);
    });
  } else {
    console.log(`\n❌ No room exists between User 1 and User 4`);
    console.log(`   When ADMIN clicks "Chat" with User 4, a NEW room will be created`);
  }

  // Check what getRooms() would return for ADMIN
  console.log('\n=== What ADMIN sees in room list ===\n');
  
  const adminRooms = await prisma.room.findMany({
    where: {
      isActive: true,
      // ADMIN sees ALL rooms (no member filter)
    },
    include: {
      members: {
        where: { leftAt: null },
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { id: 'asc' },
  });

  console.log(`ADMIN can see ${adminRooms.length} rooms total:\n`);
  adminRooms.forEach(room => {
    const memberNames = room.members.map(m => m.user.name).join(' <-> ');
    const isAdminMember = room.members.some(m => m.userId === 1);
    console.log(`  Room ${room.id} (${room.type}): ${memberNames} ${isAdminMember ? '✅ MEMBER' : '👁️ VIEW ONLY'}`);
  });

  await prisma.$disconnect();
}

debugRoomCreation().catch(console.error);
