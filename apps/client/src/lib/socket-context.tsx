"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
  apiUrl?: string;
}

export function SocketProvider({
  children,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
}: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const isConnecting = useRef(false);

  const connect = useCallback(
    (token: string) => {
      if (socket?.connected) {
        return;
      }

      if (isConnecting.current) {
        return;
      }

      isConnecting.current = true;

      const newSocket = io(apiUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        query: { token },
      });

      newSocket.on("connect", () => {
        setIsConnected(true);
        isConnecting.current = false;
      });

      newSocket.on("disconnect", (reason) => {
        setIsConnected(false);
        isConnecting.current = false;
      });

      newSocket.on("connect_error", (error) => {
        console.error("[Socket] Connection error:", error.message);
        setIsConnected(false);
        isConnecting.current = false;
      });

      newSocket.on("connection:success", (data) => {
        // Connection confirmed
      });

      setSocket(newSocket);
    },
    [socket, apiUrl],
  );

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      isConnecting.current = false;
    }
  }, [socket]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, connect, disconnect }}
    >
      {children}
    </SocketContext.Provider>
  );
}
