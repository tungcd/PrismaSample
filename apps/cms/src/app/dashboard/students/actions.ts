"use server";

import { createStudentUseCase } from "@/application/use-cases/student/create-student.use-case";
import { updateStudentUseCase } from "@/application/use-cases/student/update-student.use-case";
import { deleteStudentUseCase } from "@/application/use-cases/student/delete-student.use-case";
import { toggleStudentActiveUseCase } from "@/application/use-cases/student/toggle-student-active.use-case";
import { parseDbError } from "@/lib/utils/error-handler";
import { withRole } from "@/lib/with-auth";
import type {
  CreateStudentDTO,
  UpdateStudentDTO,
} from "@/domain/repositories/student.repository.interface";

/**
 * Create new student - ADMIN, MANAGER, and STAFF can create students
 * Authentication & Authorization: Verified via JWT token from cookies
 */
export const createStudentAction = withRole(
  ["ADMIN", "MANAGER", "STAFF"],
  async (authUser, data: CreateStudentDTO) => {
    try {
      const student = await createStudentUseCase.execute(data);
      // Note: No revalidatePath here - client component handles refresh
      return { success: true, data: student };
    } catch (error: any) {
      return { success: false, error: parseDbError(error) };
    }
  },
);

/**
 * Update student - ADMIN, MANAGER, and STAFF can update students
 * Authentication & Authorization: Verified via JWT token from cookies
 */
export const updateStudentAction = withRole(
  ["ADMIN", "MANAGER", "STAFF"],
  async (authUser, id: number, data: UpdateStudentDTO) => {
    try {
      const student = await updateStudentUseCase.execute(id, data);
      // Note: No revalidatePath here - client component handles refresh
      return { success: true, data: student };
    } catch (error: any) {
      return { success: false, error: parseDbError(error) };
    }
  },
);

/**
 * Delete student - Only ADMIN and MANAGER can delete students
 * Authentication & Authorization: Verified via JWT token from cookies
 */
export const deleteStudentAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, id: number) => {
    try {
      await deleteStudentUseCase.execute(id);
      // Note: No revalidatePath here - client component handles refresh
      return { success: true };
    } catch (error: any) {
      return { success: false, error: parseDbError(error) };
    }
  },
);

/**
 * Toggle student active status - ADMIN, MANAGER, and STAFF can toggle
 * Authentication & Authorization: Verified via JWT token from cookies
 */
export const toggleStudentActiveAction = withRole(
  ["ADMIN", "MANAGER", "STAFF"],
  async (authUser, id: number) => {
    try {
      const student = await toggleStudentActiveUseCase.execute(id);
      // Note: No revalidatePath here - client component handles refresh
      return { success: true, data: student };
    } catch (error: any) {
      return { success: false, error: parseDbError(error) };
    }
  },
);
