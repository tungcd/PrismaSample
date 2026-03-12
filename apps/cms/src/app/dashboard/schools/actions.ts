"use server";

import { withRole } from "@/lib/with-auth";
import { schoolRepository } from "@/infrastructure/database/repositories/school.repository";
import { GetAllSchoolsUseCase } from "@/application/use-cases/school/get-all-schools.use-case";
import { CreateSchoolUseCase } from "@/application/use-cases/school/create-school.use-case";
import { UpdateSchoolUseCase } from "@/application/use-cases/school/update-school.use-case";
import { DeleteSchoolUseCase } from "@/application/use-cases/school/delete-school.use-case";
import { ToggleSchoolActiveUseCase } from "@/application/use-cases/school/toggle-school-active.use-case";
import {
  CreateSchoolDTO,
  UpdateSchoolDTO,
  FindSchoolsParams,
} from "@/domain/repositories/school.repository.interface";

// Initialize use cases
const getAllSchoolsUseCase = new GetAllSchoolsUseCase(schoolRepository);
const createSchoolUseCase = new CreateSchoolUseCase(schoolRepository);
const updateSchoolUseCase = new UpdateSchoolUseCase(schoolRepository);
const deleteSchoolUseCase = new DeleteSchoolUseCase(schoolRepository);
const toggleSchoolActiveUseCase = new ToggleSchoolActiveUseCase(
  schoolRepository,
);

// Get all schools with pagination and filters
export const getAllSchoolsAction = withRole(
  ["ADMIN"],
  async (authUser, params: FindSchoolsParams) => {
    try {
      const result = await getAllSchoolsUseCase.execute(params);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch schools",
      };
    }
  },
);

// Create school
export const createSchoolAction = withRole(
  ["ADMIN"],
  async (authUser, data: CreateSchoolDTO) => {
    try {
      const school = await createSchoolUseCase.execute(data);
      return { success: true, data: school };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create school",
      };
    }
  },
);

// Update school
export const updateSchoolAction = withRole(
  ["ADMIN"],
  async (authUser, id: number, data: UpdateSchoolDTO) => {
    try {
      const school = await updateSchoolUseCase.execute(id, data);
      return { success: true, data: school };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update school",
      };
    }
  },
);

// Delete school
export const deleteSchoolAction = withRole(
  ["ADMIN"],
  async (authUser, id: number) => {
    try {
      await deleteSchoolUseCase.execute(id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete school",
      };
    }
  },
);

// Toggle school active status
export const toggleSchoolActiveAction = withRole(
  ["ADMIN"],
  async (authUser, id: number) => {
    try {
      const school = await toggleSchoolActiveUseCase.execute(id);
      return { success: true, data: school };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to toggle school status",
      };
    }
  },
);
