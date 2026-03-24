"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChatRoom, useTyping } from "@/lib/hooks/use-chat";
import { getUser } from "@/lib/auth-client";
import { useChatSocket } from "@/lib/chat-socket";
import { formatDistanceToNow, format } from "date-fns";
import { useRouter } from "next/navigation";
import { ChatInput } from "./chat-input";
import { EmojiPicker } from "./emoji-picker";
import { MessageContextMenu, MessageActionIcons } from "./message-context-menu";
import { GroupInfoDrawer } from "./group-info-drawer";
import { AddMembersDialog } from "./add-members-dialog";
import { chatApi } from "@/lib/api/chat-api";

interface ChatRoomProps {
  roomId: number;
}

export function ChatRoom({ roomId }: ChatRoomProps) {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  
  // Handle hydration
  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, []);
  
  const { addReaction, removeReaction, deleteMessage } = useChatSocket();
  const {
    room,
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    sendMessage,
    loadMoreMessages,
    messagesEndRef,
  } = useChatRoom(roomId);

  const { typingUsers, handleTyping, handleStopTyping } = useTyping(roomId);

  const [inputValue, setInputValue] = useState("");
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    message: any;
  } | null>(null);
  const [reactionPicker, setReactionPicker] = useState<{
    messageId: number;
  } | null>(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const handleSend = async (attachments?: Array<{ url: string; type: string; name: string }>) => {
    if (!inputValue.trim() && (!attachments || attachments.length === 0)) return;

    if (editingMessage) {
      // Edit existing message (no attachments support for edits)
      try {
        await chatApi.editMessage(editingMessage.id, inputValue);
        setEditingMessage(null);
        setInputValue("");
      } catch (error) {
        console.error("[ChatRoom] Failed to edit message:", error);
        alert("Failed to edit message");
      }
    } else {
      // Send new message with optional attachments
      try {
        if (attachments && attachments.length > 0) {
          await chatApi.sendMessage(roomId, {
            content: inputValue || "(File attachment)",
            replyToId: replyingTo?.id,
            attachments: attachments.map((att) => ({
              url: att.url,
              fileName: att.name,
              fileType: att.type,
              fileSize: 0,
            })),
          });
        } else {
          await sendMessage(inputValue, replyingTo?.id);
        }
        
        setInputValue("");
        setReplyingTo(null);
      } catch (error: any) {
        console.error("[ChatRoom] Failed to send message:", error);
        alert(`Failed to send message: ${error.message || 'Unknown error'}`);
      }
    }
    
    handleStopTyping();
  };

  const handleEdit = (message: any) => {
    setEditingMessage(message);
    setInputValue(message.content);
    setContextMenu(null);
  };

  const handleDelete = async (message: any, forEveryone: boolean) => {
    if (isDeleting) return; // Prevent double-click
    
    try {
      setIsDeleting(true);
      // Use WebSocket for real-time updates
      deleteMessage(message.id, forEveryone);
      setContextMenu(null);
    } catch (error: any) {
      console.error("Failed to delete message:", error);
      alert(error?.message || "Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReply = (message: any) => {
    setReplyingTo(message);
    setContextMenu(null);
  };

  const handleCopy = (message: any) => {
    navigator.clipboard.writeText(message.content);
    setContextMenu(null);
  };

  const handleAddReaction = async (messageId: number, emoji: string) => {
    try {
      await addReaction(messageId, emoji);
      setReactionPicker(null);
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setInputValue("");
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleContextMenu = (e: React.MouseEvent, message: any) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      message,
    });
  };

  const handleLeaveGroup = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;

    try {
      await chatApi.leaveRoom(roomId);
      router.push("/chat");
    } catch (error) {
      console.error("Failed to leave group:", error);
      alert("Failed to leave group");
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current || isLoadingMore || !hasMore) return;

    const { scrollTop } = messagesContainerRef.current;
    // Load more when scrolled to top (within 100px)
    if (scrollTop < 100) {
      loadMoreMessages();
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Room not found</p>
      </div>
    );
  }

  // Get display info for DIRECT chats
  const otherMember = room.type === "DIRECT" 
    ? room.members.find((m) => m.userId !== Number(user?.id)) 
    : null;
  const displayName = room.type === "DIRECT" && otherMember
    ? otherMember.user.name
    : room.name || "Group Chat";

  return (
    <div className="flex flex-col max-h-full overflow-hidden bg-white" style={{
        height: "calc(100vh - 138px)", // Full viewport height minus header and input
    }}>
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center space-x-3 bg-white shadow-sm flex-shrink-0">
        <div className="flex-shrink-0">
          {otherMember?.user.avatar || room.avatar ? (
            <img
              src={otherMember?.user.avatar || room.avatar || ""}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">{displayName}</h2>
          {room.type === "GROUP" && (
            <p className="text-xs text-gray-500">{room.members.length} members</p>
          )}
        </div>

        {/* Actions */}
        {room.type === "GROUP" ? (
          <button 
            onClick={() => setShowGroupInfo(true)}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Group Info"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        ) : (
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 pb-6 space-y-4 bg-gray-50 min-h-0"
      >
        {isLoadingMore && (
          <div className="text-center py-2">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          </div>
        )}

        {messages.map((message, index) => {
          const isFromMe = message.senderId === Number(user?.id);
          const showAvatar =
            !isFromMe &&
            (index === 0 ||
              messages[index - 1].senderId !== message.senderId);

          return (
            <MessageItem
              key={message.id}
              message={message}
              isFromMe={isFromMe}
              showAvatar={showAvatar}
              onContextMenu={(e) => handleContextMenu(e, message)}
              onReactionClick={() => setReactionPicker({ messageId: message.id })}
            />
          );
        })}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
            <span>
              {typingUsers[0].userName} {typingUsers.length > 1 && `and ${typingUsers.length - 1} other${typingUsers.length > 2 ? 's' : ''}`} typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white flex-shrink-0">
        {/* Reply/Edit Preview */}
        {(replyingTo || editingMessage) && (
          <div className="px-4 pt-3 pb-2 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                {editingMessage ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="font-medium">Edit message</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <span className="font-medium">Reply to {replyingTo?.sender.name}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-700 truncate">
                {editingMessage ? editingMessage.content : replyingTo?.content}
              </p>
            </div>
            <button
              onClick={editingMessage ? handleCancelEdit : handleCancelReply}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
          placeholder={editingMessage ? "Edit message..." : "Type a message..."}
        />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          actions={[
            {
              id: "reply",
              label: "Reply",
              icon: MessageActionIcons.reply,
              onClick: () => handleReply(contextMenu.message),
            },
            {
              id: "copy",
              label: "Copy Text",
              icon: MessageActionIcons.copy,
              onClick: () => handleCopy(contextMenu.message),
            },
            {
              id: "edit",
              label: "Edit",
              icon: MessageActionIcons.edit,
              onClick: () => handleEdit(contextMenu.message),
              show: contextMenu.message.senderId === Number(user?.id),
            },
            {
              id: "delete",
              label: "Delete",
              icon: MessageActionIcons.delete,
              onClick: () => {
                const canDeleteForEveryone = 
                  contextMenu.message.senderId === Number(user?.id) &&
                  (new Date().getTime() - new Date(contextMenu.message.createdAt).getTime()) < 5 * 60 * 1000;
                
                if (canDeleteForEveryone) {
                  const choice = confirm("Delete for everyone?");
                  handleDelete(contextMenu.message, choice);
                } else {
                  handleDelete(contextMenu.message, false);
                }
              },
              show: contextMenu.message.senderId === Number(user?.id),
              variant: "danger" as const,
            },
          ]}
        />
      )}

      {/* Reaction Picker */}
      {reactionPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="relative">
            <EmojiPicker
              onEmojiSelect={(emoji) => handleAddReaction(reactionPicker.messageId, emoji)}
              onClose={() => setReactionPicker(null)}
            />
          </div>
        </div>
      )}

      {/* Group Info Drawer */}
      {room.type === "GROUP" && (
        <GroupInfoDrawer
          isOpen={showGroupInfo}
          onClose={() => setShowGroupInfo(false)}
          room={room}
          onAddMembers={() => {
            setShowGroupInfo(false);
            setShowAddMembers(true);
          }}
          onLeaveGroup={handleLeaveGroup}
        />
      )}

      {/* Add Members Dialog */}
      {room.type === "GROUP" && (
        <AddMembersDialog
          isOpen={showAddMembers}
          onClose={() => setShowAddMembers(false)}
          roomId={room.id}
          existingMemberIds={room.members.map((m) => m.userId)}
        />
      )}
    </div>
  );
}

interface MessageItemProps {
  message: any;
  isFromMe: boolean;
  showAvatar: boolean;
  onContextMenu: (e: React.MouseEvent) => void;
  onReactionClick: () => void;
}

function MessageItem({ message, isFromMe, showAvatar, onContextMenu, onReactionClick }: MessageItemProps) {
  const [showActions, setShowActions] = useState(false);
  const messageTime = format(new Date(message.createdAt), "HH:mm");

  return (
    <div 
      className={`flex ${isFromMe ? "justify-end" : "justify-start"} group`}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex ${isFromMe ? "flex-row-reverse" : "flex-row"} items-end space-x-2 max-w-[70%] relative`}>
        {/* Avatar */}
        {!isFromMe && (
          <div className="flex-shrink-0 w-8">
            {showAvatar && (
              message.sender.avatar ? (
                <img
                  src={message.sender.avatar}
                  alt={message.sender.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                  {message.sender.name.charAt(0).toUpperCase()}
                </div>
              )
            )}
          </div>
        )}

        {/* Message bubble */}
        <div className="flex-1">
          {!isFromMe && showAvatar && (
            <p className="text-xs text-gray-600 mb-1 ml-2">{message.sender.name}</p>
          )}
          
          <div className="relative">
            {/* Quick actions (on hover) */}
            {showActions && (
              <div className={`absolute -top-8 ${isFromMe ? 'right-0' : 'left-0'} flex items-center gap-1 bg-white shadow-lg rounded-lg p-1 z-10`}>
                <button
                  onClick={onReactionClick}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  title="Add reaction"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button
                  onClick={onContextMenu}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  title="More actions"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            )}

            <div
              className={`rounded-2xl px-4 py-2 ${
                isFromMe
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-900 shadow-sm"
              }`}
            >
            {/* Reply indicator */}
            {message.replyTo && (
              <div className={`text-xs mb-2 pb-2 border-l-2 pl-2 ${isFromMe ? "border-blue-400" : "border-gray-300"}`}>
                <p className="font-medium">{message.replyTo.sender.name}</p>
                <p className={isFromMe ? "text-blue-100" : "text-gray-500"}>
                  {message.replyTo.content}
                </p>
              </div>
            )}

            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment: any, index: number) => (
                  <div key={index} className="rounded overflow-hidden">
                    {attachment.fileType.startsWith("image/") ? (
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={attachment.url}
                          alt={attachment.fileName}
                          className="max-w-full rounded cursor-pointer hover:opacity-90 transition-opacity"
                          style={{ maxHeight: "300px" }}
                        />
                      </a>
                    ) : (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 p-2 rounded ${
                          isFromMe ? "bg-blue-500" : "bg-gray-100"
                        } hover:opacity-90 transition-opacity`}
                      >
                        <svg className={`w-5 h-5 ${isFromMe ? "text-white" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate ${isFromMe ? "text-white" : "text-gray-900"}`}>
                            {attachment.fileName}
                          </div>
                          <div className={`text-xs ${isFromMe ? "text-blue-100" : "text-gray-500"}`}>
                            {(attachment.fileSize / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <svg className={`w-4 h-4 ${isFromMe ? "text-white" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
              isFromMe ? "text-blue-100" : "text-gray-500"
            }`}>
              <span>{messageTime}</span>
              {message.editedAt && <span>(edited)</span>}
              
              {/* Read status for sender */}
              {isFromMe && (
                <span>
                  {message.status === "READ" && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      <path d="M12.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-1-1a1 1 0 011.414-1.414l.293.293 7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  )}
                  {message.status === "DELIVERED" && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  )}
                  {message.status === "SENT" && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  )}
                  {message.status === "SENDING" && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 ml-2">
              {Object.entries(
                message.reactions.reduce((acc: any, r: any) => {
                  acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                  return acc;
                }, {})
              ).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={onReactionClick}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                >
                  {emoji} {count as number}
                </button>
              ))}
              <button
                onClick={onReactionClick}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                title="Add reaction"
              >
                +
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
