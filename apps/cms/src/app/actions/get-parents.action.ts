"use server";

import { prisma } from "@/infrastructure/database/prisma-client";
import {
  InfiniteSelectResult,
  SelectableEntity,
} from "@/components/ui/infinite-select-box";
import { formatPhoneNumber } from "@/lib/utils";

/**
 * Parent entity for select box (User with role PARENT)
 */
export interface ParentSelectEntity extends SelectableEntity {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

/**
 * Fetch parents with pagination and search
 * Used for InfiniteSelectBox in student forms
 */
export async function getParentsForSelect(
  page: number,
  search: string,
): Promise<InfiniteSelectResult<ParentSelectEntity>> {
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  try {
    const where = {
      role: "PARENT" as const,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
        orderBy: { name: "asc" },
        skip,
        take: pageSize + 1, // Fetch one extra to check if there's more
      }),
      prisma.user.count({ where }),
    ]);

    // Check if there are more results
    const hasMore = users.length > pageSize;
    const data = hasMore ? users.slice(0, pageSize) : users;

    // Transform to SelectableEntity format
    const parents: ParentSelectEntity[] = data.map((user: any) => ({
      id: user.id, // Keep as string (cuid)
      name: user.name,
      email: user.email,
      phone: formatPhoneNumber(user.phone),
    }));

    return {
      data: parents,
      hasMore,
    };
  } catch (error) {
    console.error("Error fetching parents:", error);
    return {
      data: [],
      hasMore: false,
    };
  }
}

/**
 * Fetch single parent by ID
 * Used for loading default selected value
 */
export async function getParentById(
  id: string | number,
): Promise<ParentSelectEntity | null> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: typeof id === "string" ? parseInt(id) : id,
        role: "PARENT",
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: formatPhoneNumber(user.phone),
    };
  } catch (error) {
    console.error("Error fetching parent by ID:", error);
    return null;
  }
}
