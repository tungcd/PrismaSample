"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useChatSocket, type Room, type ChatMessage } from "../chat-socket";
import { chatApi } from "../api/chat-api";
import { getUser } from "../auth-client";

/**
 * Hook to manage chat rooms list
 */
export function useChat() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = getUser();
  const { isConnected, onMessageNew } = useChatSocket();

  // Load rooms
  const loadRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await chatApi.getRooms();
      setRooms(data);
    } catch (err: any) {
      console.error("Error loading rooms:", err);
      setError(err.message || "Failed to load chats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadRooms();
  }, []);

  // Listen for new messages to update room previews
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onMessageNew((data) => {
      setRooms((prevRooms) => {
        const updatedRooms = prevRooms.map((room) => {
          if (room.id === data.roomId) {
            // Only increment unread if message is not from current user
            const isFromMe = data.message.senderId === Number(user?.id);
            return {
              ...room,
              lastMessageAt: data.message.createdAt,
              lastMessagePreview: data.message.content.substring(0, 100),
              unreadCount: isFromMe ? room.unreadCount : room.unreadCount + 1,
            };
          }
          return room;
        });

        // Sort by last message time
        return updatedRooms.sort((a, b) => {
          const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return bTime - aTime;
        });
      });
    });

    return () => unsubscribe();
  }, [isConnected, user?.id]);

  // Create or get direct room
  const getOrCreateDirectRoom = useCallback(async (userId: number) => {
    try {
      const room = await chatApi.getOrCreateDirectRoom(userId);
      
      // Add to rooms if not already there
      setRooms((prevRooms) => {
        const exists = prevRooms.find((r) => r.id === room.id);
        if (exists) return prevRooms;
        return [room, ...prevRooms];
      });

      return room;
    } catch (err: any) {
      console.error("Error creating room:", err);
      throw err;
    }
  }, []);

  // Mark room as read
  const markRoomAsRead = useCallback((roomId: number) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room,
      ),
    );
  }, []);

  return {
    rooms,
    isLoading,
    error,
    loadRooms,
    getOrCreateDirectRoom,
    markRoomAsRead,
  };
}

/**
 * Hook to manage a specific chat room and its messages
 */
export function useChatRoom(roomId: number) {
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const user = getUser();
  const {
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage: sendMessageSocket,
    markAsRead,
    onMessageNew,
    onMessageEdited,
    onMessageDeleted,
    onReactionAdded,
    onReactionRemoved,
  } = useChatSocket();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load room and messages
  const loadRoom = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load room details
      const roomData = await chatApi.getRoom(roomId);
      setRoom(roomData);

      // Load messages
      const messagesData = await chatApi.getMessages(roomId, { limit: 50 });
      setMessages(messagesData.messages);
      setHasMore(messagesData.hasMore);

      // Join room via socket
      if (isConnected) {
        joinRoom(roomId);
      }

      // Mark as read
      if (messagesData.messages.length > 0) {
        const lastMessage = messagesData.messages[messagesData.messages.length - 1];
        setTimeout(() => {
          markAsRead(roomId, lastMessage.id);
        }, 1000);
      }
    } catch (err: any) {
      console.error("Error loading room:", err);
      setError(err.message || "Failed to load chat");
    } finally {
      setIsLoading(false);
    }
  }, [roomId, isConnected, joinRoom, markAsRead]);

  // Initial load
  useEffect(() => {
    loadRoom();

    return () => {
      if (isConnected) {
        leaveRoom(roomId);
      }
    };
  }, [roomId, isConnected]);

  // Listen for new messages
  useEffect(() => {
    if (!isConnected) return;

    console.log('[useChatRoom CMS] Setting up message:new listener');

    const unsubscribe = onMessageNew((data) => {
      console.log('[useChatRoom CMS] Received message:new', {
        roomId: data.roomId,
        currentRoomId: roomId,
        messageId: data.message.id,
        senderId: data.message.senderId,
        currentUserId: user?.id,
      });

      if (data.roomId === roomId) {
        setMessages((prev) => {
          console.log('[useChatRoom CMS] Processing message, current messages:', prev.length);
          
          // Avoid duplicates by checking if message with this ID already exists
          const exists = prev.find((m) => m.id === data.message.id);
          if (exists) {
            console.log('[useChatRoom CMS] Message already exists, skipping');
            return prev;
          }
          
          // If this is our own message, find and replace the matching temporary message
          if (data.message.senderId === Number(user?.id)) {
            console.log('[useChatRoom CMS] This is our message, looking for temp message to replace');
            
            // Find the most recent temporary message with matching content
            const tempIndex = prev.findIndex(
              (m) => m.status === "SENDING" && 
                     m.content === data.message.content &&
                     m.senderId === data.message.senderId
            );
            
            if (tempIndex !== -1) {
              console.log('[useChatRoom CMS] Found temp message at index', tempIndex, '- replacing');
              // Replace temporary message with real one
              const updated = [...prev];
              updated[tempIndex] = data.message;
              return updated;
            } else {
              console.log('[useChatRoom CMS] No temp message found, adding new message');
            }
          }
          
          // Add new message (either from others or no matching temp found)
          console.log('[useChatRoom CMS] Adding new message to list');
          return [...prev, data.message];
        });

        // Auto-scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);

        // Mark as read if message is from someone else
        if (data.message.senderId !== Number(user?.id)) {
          setTimeout(() => {
            markAsRead(roomId, data.message.id);
          }, 1000);
        }
      }
    });

    return () => {
      console.log('[useChatRoom CMS] Cleaning up message:new listener');
      unsubscribe();
    };
  }, [isConnected, roomId, markAsRead, user?.id]);

  // Listen for message edits
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onMessageEdited((data) => {
      if (data.roomId === roomId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.message.id ? { ...msg, ...data.message } : msg,
          ),
        );
      }
    });

    return () => unsubscribe();
  }, [isConnected, roomId]);

  // Listen for message deletions
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onMessageDeleted((data) => {
      if (data.roomId === roomId) {
        // If deleted for everyone, remove for all users
        // If deleted for user only, only remove if current user is the one who deleted
        if (data.forEveryone || data.userId === Number(user?.id)) {
          setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
        }
        // Otherwise, keep the message visible (it's deleted for someone else only)
      }
    });

    return () => unsubscribe();
  }, [isConnected, roomId, user?.id]);

  // Listen for reaction added
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onReactionAdded((data: any) => {
      if (data.roomId === roomId) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === data.messageId) {
              // Remove any existing reactions from this user first, then add new one
              const existingReactions = msg.reactions || [];
              const filteredReactions = existingReactions.filter(
                (r) => r.userId !== data.reaction.userId
              );
              
              // Add the new reaction
              return {
                ...msg,
                reactions: [...filteredReactions, data.reaction],
              };
            }
            return msg;
          })
        );
      }
    });

    return () => unsubscribe();
  }, [isConnected, roomId, onReactionAdded]);

  // Listen for reaction removed
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onReactionRemoved((data: any) => {
      if (data.roomId === roomId) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === data.messageId) {
              // Remove reaction
              const updatedReactions = (msg.reactions || []).filter(
                (r) => !(r.userId === data.userId && r.emoji === data.emoji)
              );
              return {
                ...msg,
                reactions: updatedReactions,
              };
            }
            return msg;
          })
        );
      }
    });

    return () => unsubscribe();
  }, [isConnected, roomId, onReactionRemoved]);

  // Send message
  const sendMessage = useCallback(
    async (content: string, replyToId?: number) => {
      if (!content.trim()) return;

      try {
        // Optimistic update with negative temp ID to avoid conflicts
        const tempMessage: ChatMessage = {
          id: -Date.now(), // Negative temporary ID
          roomId,
          senderId: Number(user!.id),
          content,
          contentType: "TEXT",
          status: "SENDING",
          createdAt: new Date().toISOString(),
          sender: {
            id: Number(user!.id),
            name: user!.name,
            avatar: user!.avatar || undefined,
            role: user!.role,
          },
        };

        setMessages((prev) => [...prev, tempMessage]);

        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);

        // Send via socket (preferred)
        if (isConnected) {
          sendMessageSocket(roomId, content, replyToId);
        } else {
          // Fallback to REST API
          await chatApi.sendMessage(roomId, { content, replyToId });
        }
      } catch (err: any) {
        console.error("Error sending message:", err);
        setError(err.message || "Failed to send message");
      }
    },
    [roomId, user, isConnected, sendMessageSocket],
  );

  // Load more messages (scroll up)
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const oldestMessageId = messages[0]?.id;

      const data = await chatApi.getMessages(roomId, {
        before: oldestMessageId,
        limit: 50,
      });

      setMessages((prev) => [...data.messages, ...prev]);
      setHasMore(data.hasMore);
    } catch (err: any) {
      console.error("Error loading more messages:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [roomId, messages, hasMore, isLoadingMore]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return {
    room,
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    sendMessage,
    loadMoreMessages,
    scrollToBottom,
    messagesEndRef,
  };
}

/**
 * Hook to manage typing indicators
 */
export function useTyping(roomId: number) {
  const [typingUsers, setTypingUsers] = useState<
    Array<{ userId: number; userName: string }>
  >([]);
  const { isConnected, startTyping, stopTyping, onTypingStarted, onTypingStopped } =
    useChatSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const user = getUser();

  // Listen for typing events
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeStarted = onTypingStarted((data) => {
      if (data.roomId === roomId && data.userId !== Number(user?.id)) {
        setTypingUsers((prev) => {
          const exists = prev.find((u) => u.userId === data.userId);
          if (exists) return prev;
          return [...prev, { userId: data.userId, userName: data.userName }];
        });
      }
    });

    const unsubscribeStopped = onTypingStopped((data) => {
      if (data.roomId === roomId) {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      }
    });

    return () => {
      unsubscribeStarted();
      unsubscribeStopped();
    };
  }, [isConnected, roomId, user?.id]);

  // Handle user typing
  const handleTyping = useCallback(() => {
    if (!isConnected) return;

    // Start typing
    startTyping(roomId);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop after 3 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(roomId);
    }, 3000);
  }, [isConnected, roomId, startTyping, stopTyping]);

  // Stop typing explicitly
  const handleStopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isConnected) {
      stopTyping(roomId);
    }
  }, [isConnected, roomId, stopTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isConnected) {
        stopTyping(roomId);
      }
    };
  }, [isConnected, roomId, stopTyping]);

  return {
    typingUsers,
    handleTyping,
    handleStopTyping,
  };
}
