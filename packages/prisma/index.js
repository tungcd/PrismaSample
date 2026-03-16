const { PrismaClient } = require("@prisma/client");

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

module.exports = { prisma };

// Re-export all Prisma Client types for TypeScript
module.exports.PrismaClient = PrismaClient;
module.exports.Prisma = require("@prisma/client").Prisma;

// Export everything from @prisma/client
Object.assign(module.exports, require("@prisma/client"));
