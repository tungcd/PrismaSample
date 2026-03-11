"use server";

import { prisma } from "@/infrastructure/database/prisma-client";

/**
 * School entity for select box
 */
export interface SchoolSelectEntity {
  id: string;
  name: string;
}

/**
 * Fetch all active schools
 * Used for select dropdowns in student forms and filters
 */
export async function getAllSchools(): Promise<SchoolSelectEntity[]> {
  try {
    const schools = await prisma.school.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return schools;
  } catch (error) {
    console.error("Error fetching schools:", error);
    return [];
  }
}

/**
 * Fetch single school by ID
 */
export async function getSchoolById(
  id: string,
): Promise<SchoolSelectEntity | null> {
  try {
    const school = await prisma.school.findFirst({
      where: {
        id,
        deletedAt: null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return school;
  } catch (error) {
    console.error("Error fetching school by ID:", error);
    return null;
  }
}
