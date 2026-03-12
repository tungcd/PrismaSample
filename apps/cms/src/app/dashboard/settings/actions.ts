"use server";

import { withAuth } from "@/lib/with-auth";
import { updateUserUseCase } from "@/application/use-cases/user/update-user.use-case";
import { userRepository } from "@/infrastructure/database/repositories/user.repository";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";
import { getAuthUser } from "@/lib/auth-server";

// Get user data from database (fresh data, not from JWT)
export async function getUserFromDBAction() {
  try {
    const authUser = await getAuthUser();
    
    if (!authUser) {
      return { success: false, error: "Unauthorized" };
    }

    // Fetch fresh data from database
    const user = await userRepository.findById(authUser.id);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user",
    };
  }
}

export const getAuthUserAction = withAuth(async (authUser) => {
  try {
    return { success: true, data: authUser };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user",
    };
  }
});

export const changePasswordAction = withAuth(
  async (
    authUser,
    data: {
      currentPassword: string;
      newPassword: string;
    },
  ) => {
    try {
      // Get user from database with password to verify current password
      const user = await prisma.user.findUnique({
        where: { id: authUser.id },
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        data.currentPassword,
        user.passwordHash || "",
      );

      if (!isPasswordValid) {
        return { success: false, error: "Mật khẩu hiện tại không đúng" };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);

      // Update password
      await updateUserUseCase.execute(authUser.id, {
        password: hashedPassword,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to change password",
      };
    }
  },
);
