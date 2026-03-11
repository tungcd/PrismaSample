import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// JWT Secret - should match with NestJS backend
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "STAFF" | "PARENT";
  phone: string | null;
  avatar: string | null;
}

export interface JWTPayload {
  sub: number; // user id
  email: string;
  name: string;
  role: string;
  phone?: string | null;
  avatar?: string | null;
  iat?: number;
  exp?: number;
}

/**
 * Verify JWT token and return user info (Server-side only)
 * This is the SOURCE OF TRUTH for authentication
 * DO NOT trust localStorage or client-side data
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as JWTPayload;

    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role as AuthUser["role"],
      phone: decoded.phone || null,
      avatar: decoded.avatar || null,
    };
  } catch (error) {
    console.error("Auth verification failed:", error);
    return null;
  }
}

/**
 * Check if user is authenticated (Server-side only)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getAuthUser();
  return user !== null;
}

/**
 * Check if user has required role (Server-side only)
 */
export async function hasRole(
  allowedRoles: AuthUser["role"][],
): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Require authentication - throw error if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("UNAUTHORIZED: Authentication required");
  }
  return user;
}

/**
 * Require specific role - throw error if user doesn't have permission
 */
export async function requireRole(
  allowedRoles: AuthUser["role"][],
): Promise<AuthUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new Error(
      `FORBIDDEN: Required role: ${allowedRoles.join(" or ")}, but user has: ${user.role}`,
    );
  }

  return user;
}
