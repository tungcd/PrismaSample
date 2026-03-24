"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Socket } from "socket.io-client";
import { useSocket } from "./socket-context";

export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  content: string;
  contentType: string;
  status: string;
  createdAt: string;
  editedAt?: string;
  sender: {
    id: number;
    name: string;
    avatar?: string;
    role: string;
  };
  replyTo?: {
    id: number;
    content: string;
    sender: {
      id: number;
      name: string;
    };
  };
  attachments?: Array<{
    id: number;
    filename: string;
    url: string;
    mimeType: string;
    size: number;
  }>;
  reactions?: Array<{
    emoji: string;
    userId: number;
    user: {
      id: number;
      name: string;
      avatar?: string;
    };
  }>;
  reads?: Array<{
    readAt: string;
  }>;
  _count?: {
    reads: number;
  };
}

export interface Room {
  id: number;
  type: "DIRECT" | "GROUP" | "SUPPORT";
  name?: string;
  avatar?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  members: Array<{
    userId: number;
    role: string;
    user: {
      id: number;
      name: string;
      avatar?: string;
      role: string;
    };
  }>;
  _count: {
    messages: number;
  };
}

interface ChatSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
  
  // Room actions
  joinRoom: (roomId: number) => void;
  leaveRoom: (roomId: number) => void;
  
  // Message actions
  sendMessage: (roomId: number, content: string, replyToId?: number) => void;
  editMessage: (messageId: number, content: string) => void;
  deleteMessage: (messageId: number, forEveryone: boolean) => void;
  
  // Reactions
  addReaction: (messageId: number, emoji: string) => void;
  removeReaction: (messageId: number, emoji: string) => void;
  
  // Typing
  startTyping: (roomId: number) => void;
  stopTyping: (roomId: number) => void;
  
  // Read receipts
  markAsRead: (roomId: number, lastSeenMessageId?: number) => void;
  
  // Event listeners
  onMessageNew: (callback: (data: { roomId: number; message: ChatMessage }) => void) => () => void;
  onMessageEdited: (callback: (data: { roomId: number; message: ChatMessage }) => void) => () => void;
  onMessageDeleted: (callback: (data: { roomId: number; messageId: number; forEveryone: boolean; userId: number }) => void) => () => void;
  onTypingStarted: (callback: (data: { roomId: number; userId: number; userName: string }) => void) => () => void;
  onTypingStopped: (callback: (data: { roomId: number; userId: number }) => void) => () => void;
  onReactionAdded: (callback: (data: any) => void) => () => void;
  onReactionRemoved: (callback: (data: any) => void) => () => void;
  onUserStatus: (callback: (data: { userId: number; status: string }) => void) => () => void;
  onMessageReadUpdate: (callback: (data: any) => void) => () => void;
}

const ChatSocketContext = createContext<ChatSocketContextType | undefined>(undefined);

export const useChatSocket = () => {
  const context = useContext(ChatSocketContext);
  if (!context) {
    throw new Error("useChatSocket must be used within ChatSocketProvider");
  }
  return context;
};

interface ChatSocketProviderProps {
  children: React.ReactNode;
  apiUrl?: string;
}

export function ChatSocketProvider({
  children,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
}: ChatSocketProviderProps) {
  // Use main socket instead of creating separate chat socket
  const { socket: mainSocket, isConnected: mainConnected, connect: mainConnect, disconnect: mainDisconnect } = useSocket();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Sync with main socket
  useEffect(() => {
    setSocket(mainSocket);
    setIsConnected(mainConnected);
  }, [mainSocket, mainConnected]);

  const connect = useCallback(
    (token: string) => {
      // Use main socket connection
      mainConnect(token);
    },
    [mainConnect],
  );

  const disconnect = useCallback(() => {
    // Don't disconnect main socket, just clear local state
    // Main socket is managed by SocketProvider
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  // Room actions
  const joinRoom = useCallback(
    (roomId: number) => {
      if (socket?.connected) {
        socket.emit("room:join", { roomId });
      }
    },
    [socket],
  );

  const leaveRoom = useCallback(
    (roomId: number) => {
      if (socket?.connected) {
        socket.emit("room:leave", { roomId });
      }
    },
    [socket],
  );

  // Message actions
  const sendMessage = useCallback(
    (roomId: number, content: string, replyToId?: number) => {
      if (socket?.connected) {
        socket.emit("message:send", { roomId, content, replyToId });
      }
    },
    [socket],
  );

  const editMessage = useCallback(
    (messageId: number, content: string) => {
      if (socket?.connected) {
        socket.emit("message:edit", { messageId, content });
      }
    },
    [socket],
  );

  const deleteMessage = useCallback(
    (messageId: number, forEveryone: boolean) => {
      if (socket?.connected) {
        socket.emit("message:delete", { messageId, forEveryone });
      }
    },
    [socket],
  );

  // Reactions
  const addReaction = useCallback(
    (messageId: number, emoji: string) => {
      if (socket?.connected) {
        socket.emit("reaction:add", { messageId, emoji });
      }
    },
    [socket],
  );

  const removeReaction = useCallback(
    (messageId: number, emoji: string) => {
      if (socket?.connected) {
        socket.emit("reaction:remove", { messageId, emoji });
      }
    },
    [socket],
  );

  // Typing
  const startTyping = useCallback(
    (roomId: number) => {
      if (socket?.connected) {
        socket.emit("typing:start", { roomId });
      }
    },
    [socket],
  );

  const stopTyping = useCallback(
    (roomId: number) => {
      if (socket?.connected) {
        socket.emit("typing:stop", { roomId });
      }
    },
    [socket],
  );

  // Read receipts
  const markAsRead = useCallback(
    (roomId: number, lastSeenMessageId?: number) => {
      if (socket?.connected) {
        socket.emit("message:read", { roomId, lastSeenMessageId });
      }
    },
    [socket],
  );

  // Event listeners
  const onMessageNew = useCallback(
    (callback: (data: { roomId: number; message: ChatMessage }) => void) => {
      if (socket) {
        const handler = (data: { roomId: number; message: ChatMessage }) => {
          callback(data);
        };
        socket.on("message:new", handler);
        return () => {
          socket.off("message:new", handler);
        };
      }
      return () => {};
    },
    [socket],
  );

  const onMessageEdited = useCallback(
    (callback: (data: { roomId: number; message: ChatMessage }) => void) => {
      if (socket) {
        socket.on("message:edited", callback);
        return () => {
          socket.off("message:edited", callback);
        };
      }
      return () => {};
    },
    [socket],
  );

  const onMessageDeleted = useCallback(
    (callback: (data: { roomId: number; messageId: number; forEveryone: boolean; userId: number }) => void) => {
      if (socket) {
        socket.on("message:deleted", callback);
        return () => {
          socket.off("message:deleted", callback);
        };
      }
      return () => {};
    },
    [socket],
  );

  const onTypingStarted = useCallback(
    (callback: (data: { roomId: number; userId: number; userName: string }) => void) => {
      if (socket) {
        socket.on("typing:started", callback);
        return () => {
          socket.off("typing:started", callback);
        };
      }
      return () => {};
    },
    [socket],
  );

  const onTypingStopped = useCallback(
    (callback: (data: { roomId: number; userId: number }) => void) => {
      if (socket) {
        socket.on("typing:stopped", callback);
        return () => {
          socket.off("typing:stopped", callback);
        };
      }
      return () => {};
    },
    [socket],
  );

  const onReactionAdded = useCallback(
    (callback: (data: any) => void) => {
      if (socket) {
        socket.on("reaction:added", callback);
        return () => {
          socket.off("reaction:added", callback);
        };
      }
      return () => {};
    },
    [socket],
  );

  const onReactionRemoved = useCallback(
    (callback: (data: any) => void) => {
      if (socket) {
        socket.on("reaction:removed", callback);
        return () => {
          socket.off("reaction:removed", callback);
        };
      }
      return () => {};
    },
    [socket],
  );

  const onUserStatus = useCallback(
    (callback: (data: { userId: number; status: string }) => void) => {
      if (socket) {
        socket.on("user:status", callback);
        return () => {
          socket.off("user:status", callback);
        };
      }
      return () => {};
    },
    [socket],
  );

  const onMessageReadUpdate = useCallback(
    (callback: (data: any) => void) => {
      if (socket) {
        socket.on("message:read:update", callback);
        return () => {
          socket.off("message:read:update", callback);
        };
      }
      return () => {};
    },
    [socket],
  );

  const value: ChatSocketContextType = {
    socket,
    isConnected,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    startTyping,
    stopTyping,
    markAsRead,
    onMessageNew,
    onMessageEdited,
    onMessageDeleted,
    onTypingStarted,
    onTypingStopped,
    onReactionAdded,
    onReactionRemoved,
    onUserStatus,
    onMessageReadUpdate,
  };

  return (
    <ChatSocketContext.Provider value={value}>
      {children}
    </ChatSocketContext.Provider>
  );
}
