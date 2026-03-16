"use client";

import { useEffect, useState, useCallback } from "react";
import { useSocket } from "./socket-context";

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  deliveryStatus: string;
  readAt: string | null;
  createdAt: string;
  actionUrl?: string | null;
  metadata?: any;
}

export function useNotifications() {
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Listen for new notifications in real-time
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      console.log("[Notification] New notification received:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon.ico",
        });
      }
    };

    const handleNotificationRead = (data: { notificationId: number }) => {
      console.log("[Notification] Notification marked as read:", data);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === data.notificationId
            ? { ...n, readAt: new Date().toISOString(), deliveryStatus: "READ" }
            : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("notification:read", handleNotificationRead);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:read", handleNotificationRead);
    };
  }, [socket]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (token: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(
        data.notifications?.filter((n: Notification) => !n.readAt).length || 0,
      );
    } catch (error) {
      console.error("[Notification] Failed to fetch:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: number, token: string) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/notifications/${notificationId}/read`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) throw new Error("Failed to mark as read");

        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? {
                  ...n,
                  readAt: new Date().toISOString(),
                  deliveryStatus: "READ",
                }
              : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        if (socket) {
          socket.emit("notification:read", { notificationId });
        }
      } catch (error) {
        console.error("[Notification] Failed to mark as read:", error);
      }
    },
    [socket],
  );

  // Mark all as read
  const markAllAsRead = useCallback(async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to mark all as read");

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          readAt: new Date().toISOString(),
          deliveryStatus: "READ",
        })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("[Notification] Failed to mark all as read:", error);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
