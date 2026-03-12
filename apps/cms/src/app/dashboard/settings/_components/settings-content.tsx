"use client";

import { useState } from "react";
import { ProfileSettings } from "./profile-settings";
import { SecuritySettings } from "./security-settings";
import { SystemSettings } from "./system-settings";

interface SettingsContentProps {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
  };
}

export function SettingsContent({ user }: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState("profile");

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`${
              activeTab === "profile"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Thông tin cá nhân
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`${
              activeTab === "security"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Bảo mật
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab("system")}
              className={`${
                activeTab === "system"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Hệ thống
            </button>
          )}
        </nav>
      </div>

      <div>
        {activeTab === "profile" && <ProfileSettings user={user} />}
        {activeTab === "security" && <SecuritySettings />}
        {activeTab === "system" && isAdmin && <SystemSettings />}
      </div>
    </div>
  );
}
