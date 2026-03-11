"use server";

import { revalidatePath } from "next/cache";
import { createUserUseCase } from "@/application/use-cases/user/create-user.use-case";
import { updateUserUseCase } from "@/application/use-cases/user/update-user.use-case";
import { deleteUserUseCase } from "@/application/use-cases/user/delete-user.use-case";
import { toggleUserActiveUseCase } from "@/application/use-cases/user/toggle-user-active.use-case";
import { parseDbError } from "@/lib/utils/error-handler";
import type {
  CreateUserDTO,
  UpdateUserDTO,
} from "@/domain/repositories/user.repository.interface";

export async function createUserAction(data: CreateUserDTO) {
  try {
    const user = await createUserUseCase.execute(data);
    revalidatePath("/dashboard/users");
    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, error: parseDbError(error) };
  }
}

export async function updateUserAction(id: string, data: UpdateUserDTO) {
  try {
    const user = await updateUserUseCase.execute(id, data);
    revalidatePath("/dashboard/users");
    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, error: parseDbError(error) };
  }
}

export async function deleteUserAction(id: string) {
  try {
    await deleteUserUseCase.execute(id);
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: parseDbError(error) };
  }
}

export async function toggleUserActiveAction(id: string) {
  try {
    const user = await toggleUserActiveUseCase.execute(id);
    revalidatePath("/dashboard/users");
    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, error: parseDbError(error) };
  }
}
