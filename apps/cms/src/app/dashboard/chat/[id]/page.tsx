"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatRoom } from "@/components/chat/chat-room";
import { useChatSocket } from "@/lib/chat-socket";
import { getToken } from "@/lib/auth-client";

export default function CMSChatRoomPage() {
  const params = useParams();
  const { connect, isConnected } = useChatSocket();
  const router = useRouter();
  const roomId = parseInt(params.id as string);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Connect to chat websocket (run only once on mount)
    const token = getToken();
    if (token && !isConnected) {
      connect(token);
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (isNaN(roomId)) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">Invalid room ID</div>
      </div>
    );
  }

  return (
    <div className="h-full max-h-full overflow-hidden bg-gray-50" style={{
        height: "calc(100vh - 138px)", // Full viewport height minus header and input
    }}>
      <ChatRoom
        roomId={roomId}
        onBack={() => router.push("/dashboard/chat")}
      />
    </div>
  );
}
