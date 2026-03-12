"use server";

import { prisma } from "@/lib/prisma";

export interface ApproverSelectEntity {
  id: number;
  name: string;
  email: string;
  role: string;
}

export async function getApproversForSelect(): Promise<ApproverSelectEntity[]> {
  try {
    const approvers = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "MANAGER"],
        },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return approvers;
  } catch (error) {
    console.error("Failed to fetch approvers:", error);
    return [];
  }
}
