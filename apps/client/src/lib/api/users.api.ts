import { api } from "./index";

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: "STUDENT" | "PARENT" | "ADMIN" | "MANAGER" | "STAFF";
  isActive: boolean;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const usersApi = {
  /**
   * Get current user profile
   */
  getProfile: () => api.get<User>("/users/profile"),

  /**
   * Update profile
   */
  updateProfile: (data: UpdateProfileRequest) =>
    api.patch<User>("/users/profile", data),

  /**
   * Change password
   */
  changePassword: (data: ChangePasswordRequest) =>
    api.post("/users/change-password", data),
};
