import { PrismaClient } from '@smart-canteen/prisma';

const prisma = new PrismaClient();

async function checkUserAccess() {
  console.log('\n=== Checking User Access to Rooms ===\n');

  // Check which users exist
  const users = await prisma.user.findMany({
    where: {
      id: { in: [1, 4, 9] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  console.log('Users:');
  users.forEach(u => console.log(`  - ID ${u.id}: ${u.name} (${u.email}) - Role: ${u.role}`));

  // Check room 1 membership
  console.log('\n=== Room 1 Membership ===');
  const room1 = await prisma.room.findUnique({
    where: { id: 1 },
    include: {
      members: {
        where: { leftAt: null },
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
      },
    },
  });

  console.log('Room 1 Type:', room1?.type);
  console.log('Members:');
  room1?.members.forEach(m => {
    console.log(`  - User ${m.userId}: ${m.user.name} (${m.user.role}) - Role in room: ${m.role}`);
  });

  // Check all rooms for each user
  for (const user of users) {
    console.log(`\n=== Rooms for User ${user.id} (${user.name}) ===`);
    
    const userRooms = await prisma.room.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
            leftAt: null,
          },
        },
      },
      include: {
        members: {
          where: { leftAt: null },
          select: {
            userId: true,
            role: true,
          },
        },
      },
    });

    console.log(`User ${user.id} is member of ${userRooms.length} rooms:`);
    userRooms.forEach(r => {
      console.log(`  - Room ${r.id} (${r.type}): ${r.name || 'Unnamed'}`);
    });

    // If user is ADMIN, show how many total rooms exist
    if (user.role === 'ADMIN') {
      const totalRooms = await prisma.room.count();
      console.log(`  Note: As ADMIN, user can VIEW all ${totalRooms} rooms, but can only SEND messages to rooms they're members of (${userRooms.length} rooms)`);
    }
  }

  await prisma.$disconnect();
}

checkUserAccess().catch(console.error);
