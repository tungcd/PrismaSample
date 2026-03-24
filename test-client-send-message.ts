import { io } from 'socket.io-client';
import fetch from 'node-fetch';

// Configuration
const API_URL = 'http://localhost:4000';
const WS_URL = 'http://localhost:4000';

async function testClientSendMessage() {
  console.log('\n=== Testing Client Send Message Flow ===\n');

  // Step 1: Login to get token
  console.log('Step 1: Logging in...');
  const loginRes = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'parent1@example.com', // User 4
      password: 'password123',
    }),
  });

  const loginData = await loginRes.json();
  const token = loginData.accessToken;
  const userId = loginData.user.id;
  console.log(`✅ Logged in as User ${userId}: ${loginData.user.name}`);

  // Step 2: Get user's rooms
  console.log('\nStep 2: Getting user rooms...');
  const roomsRes = await fetch(`${API_URL}/api/v1/chat/rooms`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const rooms = await roomsRes.json();
  console.log(`✅ User has ${rooms.length} rooms`);
  
  if (rooms.length === 0) {
    console.log('❌ User has no rooms to send messages to');
    return;
  }

  const roomId = rooms[0].id;
  console.log(`Using Room ${roomId} for test`);

  // Step 3: Connect WebSocket
  console.log('\nStep 3: Connecting WebSocket...');
  const socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  await new Promise((resolve, reject) => {
    socket.on('connect', () => {
      console.log(`✅ WebSocket connected (socket ID: ${socket.id})`);
      resolve();
    });

    socket.on('connect_error', (err) => {
      console.error('❌ WebSocket connection error:', err.message);
      reject(err);
    });

    setTimeout(() => reject(new Error('Connection timeout')), 5000);
  });

  // Step 4: Join room
  console.log(`\nStep 4: Joining room ${roomId}...`);
  socket.emit('room:join', { roomId });
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('✅ Joined room');

  // Step 5: Send message via WebSocket
  console.log('\nStep 5: Sending message via WebSocket...');
  const testContent = `Test message via WebSocket at ${new Date().toISOString()}`;
  
  let messageReceived = false;
  socket.on('message:new', (data) => {
    console.log('✅ Received message:new event', {
      messageId: data.message.id,
      roomId: data.roomId,
      content: data.message.content,
      senderId: data.message.senderId,
    });
    messageReceived = true;
  });

  socket.emit('message:send', {
    roomId,
    content: testContent,
  });

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (messageReceived) {
    console.log('✅ Message sent and received successfully via WebSocket');
  } else {
    console.log('❌ Message sent but did not receive confirmation');
  }

  // Step 6: Verify in database
  console.log('\nStep 6: Verifying message in database...');
  const messagesRes = await fetch(`${API_URL}/api/v1/chat/rooms/${roomId}/messages?limit=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const messagesData = await messagesRes.json();
  const lastMessage = messagesData.messages[messagesData.messages.length - 1];
  
  if (lastMessage && lastMessage.content === testContent) {
    console.log('✅ Message found in database:', {
      id: lastMessage.id,
      content: lastMessage.content,
      senderId: lastMessage.senderId,
    });
  } else {
    console.log('❌ Message NOT found in database');
    console.log('Last message:', lastMessage);
  }

  // Cleanup
  socket.disconnect();
  console.log('\n=== Test Complete ===');
}

testClientSendMessage().catch(console.error);
