export { PrismaClient, Prisma } from "@prisma/client";
export * from "@prisma/client";

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient;
