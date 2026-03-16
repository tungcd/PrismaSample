# 🧪 Test Real-time Notifications on UI

## Prerequisites

- ✅ API running on http://localhost:4000
- ✅ CMS running on http://localhost:3000
- ✅ Client running on http://localhost:3001
- ✅ Database seeded with test users

## Test Flow

### Step 1: Login to Client App (Parent)

1. Open http://localhost:3001/login
2. Login with Parent credentials:
   - **Email**: `parent1@example.com`
   - **Password**: `Parent@123`
3. After login, check Browser Console:
   - Should see: `[Socket] Connected with ID: xxx`
   - Should see: `[Socket] Gateway confirmed connection`

### Step 2: Check Notification Bell

- Look at top-right of the screen
- Should see: 🔔 Bell icon with green dot (🟢 = connected)
- Click bell to open notification dropdown

### Step 3: Login to CMS (Admin)

1. Open http://localhost:3000/login in **another browser/incognito**
2. Login with Admin credentials:
   - **Email**: `admin@smartcanteen.com`
   - **Password**: `Admin@123`
3. Should also see notification bell on CMS dashboard

### Step 4: Create Order (Client) - Trigger Notification

**On Client App (Parent logged in):**

1. Go to Products page: http://localhost:3001/products
2. Add some items to cart
3. Go to Cart: http://localhost:3001/cart
4. Click "Thanh toán" (Checkout)
5. Fill in delivery details and confirm order

**Expected Real-time Behavior:**

- Order created → API emits notification
- Client app receives `notification:new` event
- Notification bell counter updates: 🔴 Badge appears
- Browser notification popup (if permission granted)

### Step 5: Check Notification in Real-time

**On Client App:**

1. Click notification bell
2. Should see new notification: "Đơn hàng đã được tạo" or similar
3. Notification has priority badge (HIGH/URGENT)
4. Click notification to mark as read
5. Badge counter decreases

### Step 6: Test Admin Notification (CMS)

**On CMS Dashboard (Admin logged in):**

1. Go to Orders: http://localhost:3000/dashboard/orders
2. Find the order you just created
3. Click "Xác nhận" (Confirm) or "Hủy" (Cancel)

**Expected Real-time Behavior:**

- CMS updates order status → API emits notification to parent
- **Switch to Client App tab** (keep it open)
- Bell icon should pulse/animate
- Counter increases without page refresh! ✨
- Click bell → see new notification instantly

### Step 7: Test Manual Notification via API

**Option A: Using cURL**

```bash
# Get Admin token first
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartcanteen.com",
    "password": "Admin@123"
  }'

# Copy the accessToken from response

# Create notification for parent (userId: 4)
curl -X POST http://localhost:4000/api/v1/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "userId": 4,
    "title": "🎉 Test Real-time Notification",
    "message": "This notification appears instantly without refresh!",
    "type": "ANNOUNCEMENT",
    "priority": "HIGH"
  }'
```

**Option B: Using Browser Console on CMS**

```javascript
// Open DevTools on CMS (F12)
// Run this in Console:

const token = localStorage.getItem("token");
fetch("http://localhost:4000/api/v1/notifications", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    userId: 4, // Parent 1
    title: "🔔 Test từ CMS Console",
    message: "Notification này xuất hiện real-time!",
    type: "ANNOUNCEMENT",
    priority: "URGENT",
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

**Expected:** Switch to Client App → Bell animates → New notification appears!

### Step 8: Test Multiple Users

1. Open Client in **3 different browsers/profiles**
2. Login as:
   - Browser 1: `parent1@example.com`
   - Browser 2: `parent2@example.com`
   - Browser 3: `parent3@example.com`
3. From CMS, create notification for ALL parents:

```javascript
// CMS Console
const token = localStorage.getItem("token");
// Broadcast to role PARENT
fetch("http://localhost:4000/api/v1/notifications/broadcast", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    role: "PARENT",
    title: "📢 Thông báo chung",
    message: "Tất cả phụ huynh nhận được tin này cùng lúc!",
    type: "ANNOUNCEMENT",
    priority: "NORMAL",
  }),
});
```

**Expected:** All 3 browsers receive notification simultaneously! 🚀

---

## 🐛 Troubleshooting

### Notification not appearing in real-time?

- Check browser console for WebSocket connection errors
- Look for: `[Socket] Connected with ID: xxx`
- If disconnected: Check API is running on port 4000
- Verify CORS settings allow localhost:3000 and localhost:3001

### Bell shows ⚠️ instead of 🟢?

- Socket not connected
- Check API logs: `docker logs smart-canteen-api | grep WebSocket`
- Verify JWT token is valid (check localStorage in DevTools)

### No notification sound/popup?

- Browser notifications need permission
- Click "Allow" when prompted
- Or go to browser settings → Site permissions → Notifications

### Counter not updating?

- Check Network tab for failed API calls
- Verify notification endpoint returns 200 OK
- Check console for `notification:new` event logs

---

## ✅ Success Checklist

- [ ] Client app shows 🟢 connected status
- [ ] CMS app shows 🟢 connected status
- [ ] Creating order triggers notification
- [ ] Notification appears without page refresh
- [ ] Bell counter updates in real-time
- [ ] Clicking notification marks as read
- [ ] Multiple users receive broadcast simultaneously
- [ ] Browser console shows Socket.IO events
- [ ] deliveryStatus changes to DELIVERED for online users

---

## 🎯 Real-world Scenarios to Test

### Scenario 1: Order Ready for Pickup

1. Parent places order
2. Admin confirms → Parent gets "Order Confirmed" notification
3. Staff marks as ready → Parent gets **URGENT** "Order Ready" notification
4. Bell pulses RED → Parent picks up order

### Scenario 2: Top-up Request Flow

1. Parent submits top-up request
2. Admin gets notification about new request
3. Admin approves → Parent gets "Top-up Approved" notification
4. Balance updates in real-time

### Scenario 3: Promotion Announcement

1. Admin creates new promotion
2. System broadcasts to ALL parents
3. All connected users see notification instantly
4. Click → Redirected to promotion details

---

## 📊 Expected Console Logs

**Client App (when receiving notification):**

```
[Socket] Connected with ID: abc123
[Socket] Gateway confirmed connection: {userId: 4, role: "PARENT"}
[Notification] New notification received: {id: 1, title: "...", ...}
```

**API Logs (when sending notification):**

```
[WebSocketsGateway] WebSocket Gateway initialized
[NotificationsService] Creating notification for user 4
[NotificationGateway] Emitting to user 4: notification:new
[NotificationsService] Delivered to user 4 (ONLINE)
```

---

**🎉 Congratulations! Real-time notifications are working!**
