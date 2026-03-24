"use client";

import React from "react";
import Link from "next/link";
import { useChat } from "@/lib/hooks/use-chat";
import { formatDistanceToNow } from "date-fns";

export function ChatList() {
  const { rooms, isLoading, error } = useChat();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p className="text-lg font-medium">No conversations yet</p>
        <p className="text-sm mt-2">Start chatting with other parents!</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {rooms.map((room) => (
        <ChatListItem key={room.id} room={room} />
      ))}
    </div>
  );
}

interface ChatListItemProps {
  room: any;
}

function ChatListItem({ room }: ChatListItemProps) {
  // Get the other user for DIRECT chats
  const otherMember = room.type === "DIRECT" ? room.members.find((m: any) => m.user) : null;
  const displayName = room.type === "DIRECT" && otherMember 
    ? otherMember.user.name 
    : room.name || "Group Chat";
  const displayAvatar = room.type === "DIRECT" && otherMember
    ? otherMember.user.avatar
    : room.avatar;

  const timeAgo = room.lastMessageAt
    ? formatDistanceToNow(new Date(room.lastMessageAt), { addSuffix: true })
    : "";

  return (
    <Link
      href={`/chat/${room.id}`}
      className="block hover:bg-gray-50 transition-colors"
    >
      <div className="p-4 flex items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          
          {/* Online indicator */}
          {room.type === "DIRECT" && (
            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white -mt-3 ml-9"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {displayName}
            </h3>
            {timeAgo && (
              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                {timeAgo}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 truncate">
              {room.lastMessagePreview || "No messages yet"}
            </p>
            
            {/* Unread badge */}
            {room.unreadCount > 0 && (
              <span className="ml-2 flex-shrink-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                {room.unreadCount > 99 ? "99+" : room.unreadCount}
              </span>
            )}

            {/* Muted indicator */}
            {room.isMuted && (
              <svg
                className="ml-2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  clipRule="evenodd"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            )}
          </div>

          {/* Group members preview */}
          {room.type === "GROUP" && room.members && (
            <div className="mt-1 text-xs text-gray-500">
              {room.members.length} members
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
