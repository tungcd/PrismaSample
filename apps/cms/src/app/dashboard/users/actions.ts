"use server";

import { createUserUseCase } from "@/application/use-cases/user/create-user.use-case";
import { updateUserUseCase } from "@/application/use-cases/user/update-user.use-case";
import { deleteUserUseCase } from "@/application/use-cases/user/delete-user.use-case";
import { toggleUserActiveUseCase } from "@/application/use-cases/user/toggle-user-active.use-case";
import { parseDbError } from "@/lib/utils/error-handler";
import { withRole } from "@/lib/with-auth";
import type {
  CreateUserDTO,
  UpdateUserDTO,
} from "@/domain/repositories/user.repository.interface";

/**
 * Create new user - Only ADMIN and MANAGER can create users
 * Authentication & Authorization: Verified via JWT token from cookies
 */
export const createUserAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, data: CreateUserDTO) => {
    try {
      const user = await createUserUseCase.execute(data);
      // Note: No revalidatePath here - client component handles refresh
      return { success: true, data: user };
    } catch (error: any) {
      return { success: false, error: parseDbError(error) };
    }
  },
);

/**
 * Update user - Only ADMIN and MANAGER can update users
 * Authentication & Authorization: Verified via JWT token from cookies
 */
export const updateUserAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, id: number, data: UpdateUserDTO) => {
    try {
      const user = await updateUserUseCase.execute(id, data);
      // Note: No revalidatePath here - client component handles refresh
      return { success: true, data: user };
    } catch (error: any) {
      return { success: false, error: parseDbError(error) };
    }
  },
);

/**
 * Delete user - Only ADMIN can delete users
 * Authentication & Authorization: Verified via JWT token from cookies
 */
export const deleteUserAction = withRole(
  ["ADMIN"],
  async (authUser, id: number) => {
    try {
      await deleteUserUseCase.execute(id);
      // Note: No revalidatePath here - client component handles refresh
      return { success: true };
    } catch (error: any) {
      return { success: false, error: parseDbError(error) };
    }
  },
);

/**
 * Toggle user active status - Only ADMIN and MANAGER can toggle
 * Authentication & Authorization: Verified via JWT token from cookies
 */
export const toggleUserActiveAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, id: number) => {
    try {
      const user = await toggleUserActiveUseCase.execute(id);
      // Note: No revalidatePath here - client component handles refresh
      return { success: true, data: user };
    } catch (error: any) {
      return { success: false, error: parseDbError(error) };
    }
  },
);
