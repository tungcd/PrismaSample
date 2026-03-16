# Socket.IO Real-time Notification Test Guide

## ✅ Current Status

- **API Server**: Running on http://localhost:4000
- **WebSocket Gateway**: ✅ Initialized
- **Database**: ✅ Seeded with 120 students + 53 users
- **Notification Events**: `notification:new`, `notification:delivered`, `notification:read`, `notification:list`

## 🧪 Test 1: Socket.IO Connection (Browser)

1. Open `test-socket.html` in your browser
2. **Without Auth**: Click "Connect" to test unauthenticated connection
3. **With Auth**:
   - First get a JWT token (see Test 2 below)
   - Paste token in the JWT Token field
   - Click "Connect"
4. Watch the connection log for events

Expected result:

```
✅ Successfully connected! Socket ID: abc123...
✅ Gateway confirmed connection
📨 Joined rooms: user:1, role:PARENT
```

---

## 🔐 Test 2: Get JWT Token via Postman/cURL

### Login as Parent (to receive notifications)

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent1@example.com",
    "password": "Parent@123"
  }'
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 4,
    "email": "parent1@example.com",
    "role": "PARENT"
  }
}
```

**Copy the `accessToken` value!**

---

## 📬 Test 3: Create Notification & Test Real-time Push

### Prerequisites:

1. Have Socket.IO connection open in browser (from Test 1) with JWT token
2. Get another JWT for Admin/Staff user to create notifications

### Login as Admin:

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartcanteen.com",
    "password": "Admin@123"
  }'
```

### Create a Test Notification (replace YOUR_ADMIN_TOKEN):

```bash
curl -X POST http://localhost:4000/api/v1/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "userId": 4,
    "title": "Test Real-time Notification",
    "message": "This is a test notification sent via Socket.IO!",
    "type": "ANNOUNCEMENT",
    "priority": "HIGH"
  }'
```

### Expected Result:

- In browser console: `🔔 New notification received: {...}`
- Notification delivered in real-time WITHOUT page refresh!

---

## 📊 Test 4: Check Unread Count

```bash
curl -X GET http://localhost:4000/api/v1/notifications/unread-count \
  -H "Authorization: Bearer YOUR_PARENT_TOKEN"
```

Response:

```json
{
  "unreadCount": 1
}
```

---

## 🎯 Test 5: Mark Notification as Read

```bash
curl -X PATCH http://localhost:4000/api/v1/notifications/1/read \
  -H "Authorization: Bearer YOUR_PARENT_TOKEN"
```

### Expected:

- Socket.IO event `notification:read` emitted
- deliveryStatus updated to `READ`

---

## 🛠️ Test 6: WebSocket Events Subscribed

Check API logs for these confirmations:

```
[WebSocketsGateway] WebSocket Gateway initialized
[WebSocketsController] NotificationGateway subscribed to the "notification:delivered" message
[WebSocketsController] NotificationGateway subscribed to the "notification:read" message
[WebSocketsController] NotificationGateway subscribed to the "notification:list" message
```

To verify:

```bash
docker logs smart-canteen-api 2>&1 | grep -i websocket
```

---

## 📝 Notification Priority Levels

| Priority   | Use Cases                                               |
| ---------- | ------------------------------------------------------- |
| **URGENT** | Order Ready for Pickup, Approval Required               |
| **HIGH**   | Order Confirmed, Order Cancelled, Top-up Approved       |
| **NORMAL** | Order Completed, Payment Success, General Announcements |
| **LOW**    | Promotional messages, Tips                              |

---

## 🔧 Troubleshooting

### "Cannot connect to Socket.IO"

- Check if API is running: `docker ps | grep smart-canteen-api`
- Check CORS settings in `main.ts`
- Verify port 4000 is not blocked

### "Authentication failed"

- Ensure JWT token is valid (not expired)
- Check token is passed in query param: `?token=YOUR_TOKEN`
- Verify JWT_SECRET in docker-compose.yml

### "No real-time notification received"

- Ensure Socket.IO client is connected and authenticated
- Check userId matches the notification recipient
- Verify NotificationGateway is injected in NotificationsService

---

## ✨ Production Notes

- Set `JWT_SECRET` to a strong random string (not default)
- Enable Redis adapter for Socket.IO clustering (if scaling horizontally)
- Add rate limiting for notification creation endpoints
- Implement notification retention policy (delete old read notifications)
- Add notification preferences (user can opt-out of certain types)

---

## 🎉 Success Criteria

✅ Socket.IO connects successfully with JWT token
✅ User joins room: `user:${userId}` and `role:${userRole}`
✅ Creating notification via API triggers real-time push
✅ Browser receives `notification:new` event instantly
✅ deliveryStatus set to `DELIVERED` if user is online
✅ Unread count updates correctly

**All features working! Ready for frontend integration!** 🚀
