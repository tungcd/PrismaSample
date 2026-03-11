import {
  IUserRepository,
  CreateUserDTO,
  UpdateUserDTO,
} from "@/domain/repositories/user.repository.interface";
import { prisma } from "../prisma-client";
import { UserEntity } from "@/domain/entities/user.entity";
import * as bcrypt from "bcryptjs";
import type { GetUsersParams } from "@/application/use-cases/user/get-all-users.use-case";

export class PrismaUserRepository implements IUserRepository {
  async findMany(
    params: GetUsersParams = {},
  ): Promise<{ users: UserEntity[]; total: number }> {
    const {
      page = 1,
      pageSize = 10,
      email,
      name,
      role,
      phone,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const where: any = { deletedAt: null };

    if (email) {
      where.email = { contains: email, mode: "insensitive" };
    }
    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }
    if (role && role !== "all") {
      where.role = role;
    }
    if (phone) {
      where.phone = { contains: phone };
    }
    if (status && status !== "all") {
      where.isActive = status === "active";
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          avatar: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map((user) => ({
        ...user,
        role: user.role as string,
      })),
      total,
    };
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return users.map((user) => ({
      ...user,
      role: user.role as string,
    }));
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) return null;

    return {
      ...user,
      role: user.role as string,
    };
  }

  async count(): Promise<number> {
    return prisma.user.count({
      where: { deletedAt: null },
    });
  }

  async create(data: CreateUserDTO): Promise<UserEntity> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role as any,
        phone: data.phone,
        passwordHash: hashedPassword,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return {
      ...user,
      role: user.role as string,
    };
  }

  async update(id: string, data: UpdateUserDTO): Promise<UserEntity> {
    const updateData: any = {
      name: data.name,
      role: data.role,
      phone: data.phone,
      avatar: data.avatar,
    };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return {
      ...user,
      role: user.role as string,
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async toggleActive(id: string): Promise<UserEntity> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!user) throw new Error("User not found");

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return {
      ...updated,
      role: updated.role as string,
    };
  }
}

export const userRepository = new PrismaUserRepository();
