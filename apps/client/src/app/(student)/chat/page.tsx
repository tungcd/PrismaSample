"use client";

import React, { useEffect, useState } from "react";
import { ChatList } from "@/components/chat/chat-list";
import { NewChatDialog } from "@/components/chat/new-chat-dialog";
import { CreateGroupDialog } from "@/components/chat/create-group-dialog";
import { useChatSocket } from "@/lib/chat-socket";
import { getUser, getToken } from "@/lib/auth-client";

export default function ChatPage() {
  const { connect, isConnected } = useChatSocket();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Handle hydration and connection
  useEffect(() => {
    setMounted(true);
    const userData = getUser();
    setUser(userData);
    
    // Connect to chat websocket only once
    const token = getToken();
    if (token && !isConnected) {
      connect(token);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto max-w-4xl h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500">
            {isConnected ? (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Connected
              </span>
            ) : (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                Connecting...
              </span>
            )}
          </p>
        </div>

        {/* New chat button with dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>New</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                <button
                  onClick={() => {
                    setShowNewChatDialog(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-gray-700 font-medium">New Chat</span>
                </button>
                <button
                  onClick={() => {
                    setShowCreateGroupDialog(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-gray-700 font-medium">Create Group</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto bg-white">
        <ChatList />
      </div>

      {/* Dialogs */}
      <NewChatDialog 
        isOpen={showNewChatDialog}
        onClose={() => setShowNewChatDialog(false)}
      />
      <CreateGroupDialog
        isOpen={showCreateGroupDialog}
        onClose={() => setShowCreateGroupDialog(false)}
      />
    </div>
  );
}
