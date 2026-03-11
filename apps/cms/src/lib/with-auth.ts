import { requireAuth, requireRole, type AuthUser } from "./auth-server";

/**
 * Higher-order function to protect Server Actions with authentication
 * Usage:
 *
 * export const myAction = withAuth(async (user) => {
 *   // user is guaranteed to be authenticated
 *   return { success: true };
 * });
 */
export function withAuth<T extends any[], R>(
  handler: (user: AuthUser, ...args: T) => Promise<R>,
) {
  return async (...args: T): Promise<R> => {
    try {
      const user = await requireAuth();
      return await handler(user, ...args);
    } catch (error: any) {
      // Return error in consistent format
      if (error.message?.startsWith("UNAUTHORIZED")) {
        return {
          success: false,
          error: "Vui lòng đăng nhập để tiếp tục",
        } as any;
      }
      throw error;
    }
  };
}

/**
 * Higher-order function to protect Server Actions with role-based authorization
 * Usage:
 *
 * export const deleteUserAction = withRole(["ADMIN"], async (user, id: number) => {
 *   // Only ADMIN can access this
 *   await deleteUser(id);
 *   return { success: true };
 * });
 */
export function withRole<T extends any[], R>(
  allowedRoles: AuthUser["role"][],
  handler: (user: AuthUser, ...args: T) => Promise<R>,
) {
  return async (...args: T): Promise<R> => {
    try {
      const user = await requireRole(allowedRoles);
      return await handler(user, ...args);
    } catch (error: any) {
      // Return error in consistent format
      if (error.message?.startsWith("UNAUTHORIZED")) {
        return {
          success: false,
          error: "Vui lòng đăng nhập để tiếp tục",
        } as any;
      }
      if (error.message?.startsWith("FORBIDDEN")) {
        return {
          success: false,
          error: "Bạn không có quyền thực hiện thao tác này",
        } as any;
      }
      throw error;
    }
  };
}

/**
 * Helper to check if action result is an authorization error
 */
export function isAuthError(result: any): boolean {
  return (
    result?.success === false &&
    (result?.error?.includes("đăng nhập") ||
      result?.error?.includes("không có quyền"))
  );
}
