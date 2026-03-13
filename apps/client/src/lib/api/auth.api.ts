import { api } from "./index";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    phone?: string;
    avatar?: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export const authApi = {
  /**
   * Login with email and password
   */
  login: (data: LoginRequest) =>
    api.post<LoginResponse>("/auth/login", data, { requireAuth: false }),

  /**
   * Verify JWT token
   */
  verify: (token: string) =>
    api.post("/auth/verify", { token }, { requireAuth: false }),

  /**
   * Refresh access token
   */
  refresh: () => api.post("/auth/refresh"),

  /**
   * Logout current user
   */
  logout: () => api.post("/auth/logout"),

  /**
   * Request password reset
   */
  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post("/auth/forgot-password", data, { requireAuth: false }),

  /**
   * Reset password with token
   */
  resetPassword: (data: ResetPasswordRequest) =>
    api.post("/auth/reset-password", data, { requireAuth: false }),
};
