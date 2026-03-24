-- Debug query to check chat messages and rooms
-- Run this in Prisma Studio or database console

-- Check all rooms
SELECT 
  id, 
  type, 
  name, 
  "lastMessageAt", 
  "lastMessagePreview",
  "createdAt"
FROM "Room"
WHERE "isActive" = true
ORDER BY "lastMessageAt" DESC;

-- Check all messages
SELECT 
  m.id,
  m."roomId",
  m."senderId",
  m.content,
  m."createdAt",
  u.name as sender_name,
  r.type as room_type,
  r.name as room_name
FROM "ChatMessage" m
JOIN "User" u ON m."senderId" = u.id
JOIN "Room" r ON m."roomId" = r.id
WHERE m."deletedAt" IS NULL
ORDER BY m."createdAt" DESC
LIMIT 20;

-- Check room members
SELECT 
  rm.id,
  rm."roomId",
  rm."userId",
  rm.role,
  rm."unreadCount",
  u.name as user_name,
  r.type as room_type
FROM "RoomMember" rm
JOIN "User" u ON rm."userId" = u.id
JOIN "Room" r ON rm."roomId" = r.id
WHERE rm."leftAt" IS NULL
ORDER BY rm."roomId", rm."userId";
