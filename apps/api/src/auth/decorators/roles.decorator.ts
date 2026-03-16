import { SetMetadata } from "@nestjs/common";
import { Role } from "@smart-canteen/prisma";

export const Roles = (...roles: Role[]) => SetMetadata("roles", roles);
