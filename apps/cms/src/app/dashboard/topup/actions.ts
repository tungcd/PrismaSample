"use server";

import { revalidatePath } from "next/cache";
import { withRole } from "@/lib/with-auth";
import { createTopUpUseCase } from "@/application/use-cases/top-up/create-top-up.use-case";
import { approveTopUpUseCase } from "@/application/use-cases/top-up/approve-top-up.use-case";
import { rejectTopUpUseCase } from "@/application/use-cases/top-up/reject-top-up.use-case";
import { deleteTopUpUseCase } from "@/application/use-cases/top-up/delete-top-up.use-case";
import { CreateTopUpDTO, ApproveTopUpDTO, RejectTopUpDTO } from "@/domain/repositories/top-up.repository.interface";

// Create top-up request (ADMIN/MANAGER/STAFF can create for parents)
export const createTopUpAction = withRole(
  ["ADMIN", "MANAGER", "STAFF"],
  async (authUser, data: CreateTopUpDTO) => {
    try {
      const topUp = await createTopUpUseCase(data);
      revalidatePath("/dashboard/topup");
      return { success: true, data: topUp };
    } catch (error) {
      console.error("Failed to create top-up:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create top-up request",
      };
    }
  },
);

// Approve top-up request (ADMIN/MANAGER only)
export const approveTopUpAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, id: number, adminNotes?: string) => {
    try {
      console.log("[Approve] AuthUser:", { id: authUser.id, email: authUser.email, role: authUser.role });
      const topUp = await approveTopUpUseCase(id, {
        approvedBy: authUser.id,
        adminNotes,
      });
      revalidatePath("/dashboard/topup");
      return { success: true, data: topUp };
    } catch (error) {
      console.error("Failed to approve top-up:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to approve top-up request",
      };
    }
  },
);

// Reject top-up request (ADMIN/MANAGER only)
export const rejectTopUpAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, id: number, adminNotes: string) => {
    try {
      console.log("[Reject] AuthUser:", { id: authUser.id, email: authUser.email, role: authUser.role });
      const topUp = await rejectTopUpUseCase(id, {
        approvedBy: authUser.id,
        adminNotes,
      });
      revalidatePath("/dashboard/topup");
      return { success: true, data: topUp };
    } catch (error) {
      console.error("Failed to reject top-up:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to reject top-up request",
      };
    }
  },
);

// Delete top-up request (ADMIN only)
export const deleteTopUpAction = withRole(
  ["ADMIN"],
  async (authUser, id: number) => {
    try {
      await deleteTopUpUseCase(id);
      revalidatePath("/dashboard/topup");
      return { success: true };
    } catch (error) {
      console.error("Failed to delete top-up:", error);
      return {
        success: false,
        error: "Failed to delete top-up request",
      };
    }
  },
);
