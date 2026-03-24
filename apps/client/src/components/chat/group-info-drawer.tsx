"use client";

import React, { useState } from "react";
import { chatApi } from "@/lib/api/chat-api";
import { getUser } from "@/lib/auth-client";

interface Member {
  id?: number;
  userId: number;
  role: "OWNER" | "ADMIN" | "MEMBER" | string;
  isMuted?: boolean;
  user: {
    id: number;
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
}

interface Room {
  id: number;
  type: "GROUP" | "DIRECT" | "SUPPORT";
  name?: string;
  avatar?: string;
  members: Member[];
}

interface GroupInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onAddMembers?: () => void;
  onLeaveGroup?: () => void;
}

export function GroupInfoDrawer({
  isOpen,
  onClose,
  room,
  onAddMembers,
  onLeaveGroup,
}: GroupInfoDrawerProps) {
  const currentUser = getUser();
  const [loading, setLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  if (!isOpen || !room) return null;

  const currentMember = room.members.find((m) => m.userId === Number(currentUser?.id));
  const isAdmin = currentMember?.role === "ADMIN" || currentMember?.role === "OWNER";
  const isOwner = currentMember?.role === "OWNER";

  const handleUpdateName = async () => {
    if (!newName.trim() || newName === room.name) {
      setEditingName(false);
      return;
    }

    setLoading(true);
    try {
      await chatApi.updateRoom(room.id, { name: newName });
      setEditingName(false);
      // Refresh room data
      window.location.reload();
    } catch (error) {
      console.error("Failed to update group name:", error);
      alert("Failed to update group name");
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteMember = async (memberId: number, role: "ADMIN" | "MEMBER") => {
    setLoading(true);
    try {
      await chatApi.updateMemberRole(room.id, memberId, role);
      alert(`Member ${role === "ADMIN" ? "promoted" : "demoted"} successfully`);
      window.location.reload();
    } catch (error) {
      console.error("Failed to update member role:", error);
      alert("Failed to update member role");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    setLoading(true);
    try {
      await chatApi.removeMember(room.id, memberId);
      alert("Member removed successfully");
      window.location.reload();
    } catch (error) {
      console.error("Failed to remove member:", error);
      alert("Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Group Info</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Group Avatar & Name */}
          <div className="p-6 text-center border-b border-gray-200">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-semibold mb-3">
              {room.name?.charAt(0).toUpperCase() || "G"}
            </div>

            {editingName ? (
              <div className="flex items-center gap-2 justify-center">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdateName();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded"
                  autoFocus
                />
                <button
                  onClick={handleUpdateName}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="text-gray-600 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  {room.name || "Unnamed Group"}
                </h3>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setNewName(room.name || "");
                      setEditingName(true);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {room.members.length} members
            </p>
          </div>

          {/* Members List */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Members</h4>
              {isAdmin && (
                <button
                  onClick={onAddMembers}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Add Members
                </button>
              )}
            </div>

            <div className="space-y-2">
              {room.members.map((member) => {
                const isSelf = member.userId === Number(currentUser?.id);
                const canManage = isAdmin && !isSelf && member.role !== "OWNER";

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {member.user.name}
                        {isSelf && (
                          <span className="text-xs text-gray-500">(You)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="capitalize">{member.role.toLowerCase()}</span>
                        {member.isMuted && (
                          <span className="text-red-600">• Muted</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {canManage && (
                      <div className="relative group">
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>

                        {/* Dropdown menu */}
                        <div className="hidden group-hover:block absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          {member.role !== "ADMIN" && (
                            <button
                              onClick={() => handlePromoteMember(member.userId, "ADMIN")}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Make Admin
                            </button>
                          )}
                          {member.role === "ADMIN" && isOwner && (
                            <button
                              onClick={() => handlePromoteMember(member.userId, "MEMBER")}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Remove Admin
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveMember(member.userId)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group Actions */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onLeaveGroup}
              className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              Leave Group
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
