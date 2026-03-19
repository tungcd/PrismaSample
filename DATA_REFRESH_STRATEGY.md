# 🔄 Data Refresh Strategy với Real-time Notifications

## Vấn đề

Khi nhận notification, data trên màn hình không được update → Hiển thị sai

## Giải pháp (3 options)

### ✅ **Option 1: Callback-based Refetch (Recommended)**

Dùng callback trong `useNotifications` để trigger refetch data cụ thể

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/lib/use-notifications";
import { getToken } from "@/lib/auth-client";

export default function WalletPage() {
  const router = useRouter();
  const [walletBalance, setWalletBalance] = useState(0);
  const [topUpRequests, setTopUpRequests] = useState([]);

  // Notification callback để refetch data
  const { notifications, unreadCount } = useNotifications({
    onNotification: async (notification) => {
      console.log("📬 Notification received:", notification);

      // Check metadata để xem cần refetch data nào
      const refetchData = notification.metadata?.refetchData || [];

      if (refetchData.includes("wallet")) {
        // Option A: Dùng data từ notification (fast)
        if (notification.metadata?.newWalletBalance !== undefined) {
          setWalletBalance(notification.metadata.newWalletBalance);
        }
        // Option B: Refetch từ API (safe)
        else {
          await fetchWalletBalance();
        }
      }

      if (refetchData.includes("topUpRequests")) {
        await fetchTopUpRequests();
      }

      // Option C: Force Next.js router refresh (refetch server components)
      // router.refresh();
    }
  });

  const fetchWalletBalance = async () => {
    const token = getToken();
    const res = await fetch("http://localhost:4000/api/v1/wallet", {
      headers: { Authorization: \`Bearer \${token}\` }
    });
    const data = await res.json();
    setWalletBalance(data.balance);
  };

  const fetchTopUpRequests = async () => {
    const token = getToken();
    const res = await fetch("http://localhost:4000/api/v1/top-up-requests", {
      headers: { Authorization: \`Bearer \${token}\` }
    });
    const data = await res.json();
    setTopUpRequests(data);
  };

  useEffect(() => {
    fetchWalletBalance();
    fetchTopUpRequests();
  }, []);

  return (
    <div>
      <h1>Wallet Balance: {walletBalance.toLocaleString()} VND</h1>
      <NotificationBell token={getToken()!} />
      {/* ... */}
    </div>
  );
}
```

---

### ⚡ **Option 2: React Query (Best for complex apps)**

```typescript
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/lib/use-notifications";

export default function WalletPage() {
  const queryClient = useQueryClient();

  // Define queries
  const { data: wallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: fetchWalletBalance,
  });

  const { data: topUpRequests } = useQuery({
    queryKey: ["topUpRequests"],
    queryFn: fetchTopUpRequests,
  });

  // Invalidate queries khi có notification
  useNotifications({
    onNotification: async (notification) => {
      const refetchData = notification.metadata?.refetchData || [];

      if (refetchData.includes("wallet")) {
        // Invalidate = mark as stale → auto refetch
        queryClient.invalidateQueries({ queryKey: ["wallet"] });
      }

      if (refetchData.includes("topUpRequests")) {
        queryClient.invalidateQueries({ queryKey: ["topUpRequests"] });
      }
    }
  });

  return (
    <div>
      <h1>Balance: {wallet?.balance}</h1>
      {/* ... */}
    </div>
  );
}
```

**Ưu điểm:**

- ✅ Auto caching
- ✅ Background refetch
- ✅ Optimistic updates
- ✅ Retry logic built-in

---

### 🔄 **Option 3: Next.js Router Refresh (Simple)**

```typescript
"use client";

import { useRouter } from "next/navigation";
import { useNotifications } from "@/lib/use-notifications";

export default function WalletPage() {
  const router = useRouter();

  useNotifications({
    onNotification: async (notification) => {
      // Force Next.js refetch tất cả server components
      router.refresh();
    }
  });

  return (/* ... */);
}
```

**Nhược điểm:**

- ❌ Refetch toàn bộ page (slow)
- ❌ Không áp dụng được cho client-side state
- ✅ Chỉ refetch server components

---

## Comparison

| Approach                | Speed       | Complexity | Best For                   |
| ----------------------- | ----------- | ---------- | -------------------------- |
| **Callback + setState** | ⚡⚡⚡ Fast | 🟢 Simple  | Small apps, few queries    |
| **React Query**         | ⚡⚡ Good   | 🟡 Medium  | Complex apps, many queries |
| **router.refresh()**    | ⚡ Slow     | 🟢 Simple  | Server-heavy pages         |

---

## 🎯 Recommendation

Dự án này nên dùng **Option 1 (Callback)** vì:

1. ✅ Đơn giản, không cần thêm dependencies
2. ✅ Metadata từ notification có sẵn `newWalletBalance` → Không cần refetch
3. ✅ Chỉ update state cần thiết → Performance tốt
4. ✅ Fallback refetch nếu cần

Nếu sau này app phức tạp hơn → Migrate sang React Query

---

## Implementation Checklist

- [x] Update `useNotifications` hook với callback
- [x] Notification metadata include `newWalletBalance` và `refetchData`
- [ ] Wallet page dùng callback để update balance
- [ ] Top-up requests page dùng callback để refresh list
- [ ] Test flow: Admin approve → Parent thấy balance update ngay

---

## Example Files to Update

**`apps/client/src/app/wallet/page.tsx`**

```typescript
const { notifications } = useNotifications({
  onNotification: async (notification) => {
    if (notification.type === "TOP_UP_APPROVED") {
      setWalletBalance(
        notification.metadata?.newWalletBalance || walletBalance,
      );
      await fetchWalletData(); // Backup refetch
    }
  },
});
```

Done! 🎉
