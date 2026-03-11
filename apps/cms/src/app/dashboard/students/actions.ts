"use server";

import { revalidatePath } from "next/cache";
import { createStudentUseCase } from "@/application/use-cases/student/create-student.use-case";
import { updateStudentUseCase } from "@/application/use-cases/student/update-student.use-case";
import { deleteStudentUseCase } from "@/application/use-cases/student/delete-student.use-case";
import { toggleStudentActiveUseCase } from "@/application/use-cases/student/toggle-student-active.use-case";
import { parseDbError } from "@/lib/utils/error-handler";
import type {
  CreateStudentDTO,
  UpdateStudentDTO,
} from "@/domain/repositories/student.repository.interface";

export async function createStudentAction(data: CreateStudentDTO) {
  try {
    const student = await createStudentUseCase.execute(data);
    revalidatePath("/dashboard/students");
    return { success: true, data: student };
  } catch (error: any) {
    return { success: false, error: parseDbError(error) };
  }
}

export async function updateStudentAction(id: string, data: UpdateStudentDTO) {
  try {
    const student = await updateStudentUseCase.execute(id, data);
    revalidatePath("/dashboard/students");
    return { success: true, data: student };
  } catch (error: any) {
    return { success: false, error: parseDbError(error) };
  }
}

export async function deleteStudentAction(id: string) {
  try {
    await deleteStudentUseCase.execute(id);
    revalidatePath("/dashboard/students");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: parseDbError(error) };
  }
}

export async function toggleStudentActiveAction(id: string) {
  try {
    const student = await toggleStudentActiveUseCase.execute(id);
    revalidatePath("/dashboard/students");
    return { success: true, data: student };
  } catch (error: any) {
    return { success: false, error: parseDbError(error) };
  }
}
