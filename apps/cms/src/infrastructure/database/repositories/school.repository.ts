import {
  ISchoolRepository,
  FindSchoolsParams,
  CreateSchoolDTO,
  UpdateSchoolDTO,
} from "@/domain/repositories/school.repository.interface";
import { prisma } from "../prisma-client";
import { SchoolEntity } from "@/domain/entities/school.entity";
import { Prisma } from "@prisma/client";

export class PrismaSchoolRepository implements ISchoolRepository {
  async findMany(
    params: FindSchoolsParams = {},
  ): Promise<{ schools: SchoolEntity[]; total: number }> {
    const {
      page = 1,
      pageSize = 10,
      name,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const where: Prisma.SchoolWhereInput = {
      deletedAt: null,
    };

    // Filter by name
    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }

    // Filter by status
    if (status && status !== "all") {
      where.isActive = status === "active";
    }

    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.school.count({ where }),
    ]);

    return {
      schools: schools.map((school) => ({
        id: school.id,
        name: school.name,
        address: school.address,
        phone: school.phone,
        email: school.email,
        isActive: school.isActive,
        createdAt: school.createdAt,
        updatedAt: school.updatedAt,
        deletedAt: school.deletedAt,
      })),
      total,
    };
  }

  async findById(id: number): Promise<SchoolEntity | null> {
    const school = await prisma.school.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!school) return null;

    return {
      id: school.id,
      name: school.name,
      address: school.address,
      phone: school.phone,
      email: school.email,
      isActive: school.isActive,
      createdAt: school.createdAt,
      updatedAt: school.updatedAt,
      deletedAt: school.deletedAt,
    };
  }

  async create(data: CreateSchoolDTO): Promise<SchoolEntity> {
    const school = await prisma.school.create({
      data: {
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        isActive: data.isActive ?? true,
      },
    });

    return {
      id: school.id,
      name: school.name,
      address: school.address,
      phone: school.phone,
      email: school.email,
      isActive: school.isActive,
      createdAt: school.createdAt,
      updatedAt: school.updatedAt,
      deletedAt: school.deletedAt,
    };
  }

  async update(id: number, data: UpdateSchoolDTO): Promise<SchoolEntity> {
    const school = await prisma.school.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.address !== undefined && { address: data.address || null }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return {
      id: school.id,
      name: school.name,
      address: school.address,
      phone: school.phone,
      email: school.email,
      isActive: school.isActive,
      createdAt: school.createdAt,
      updatedAt: school.updatedAt,
      deletedAt: school.deletedAt,
    };
  }

  async delete(id: number): Promise<void> {
    await prisma.school.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async toggleActive(id: number): Promise<SchoolEntity> {
    const school = await prisma.school.findUnique({ where: { id } });
    if (!school) {
      throw new Error("School not found");
    }

    const updated = await prisma.school.update({
      where: { id },
      data: { isActive: !school.isActive },
    });

    return {
      id: updated.id,
      name: updated.name,
      address: updated.address,
      phone: updated.phone,
      email: updated.email,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      deletedAt: updated.deletedAt,
    };
  }

  async count(): Promise<number> {
    return prisma.school.count({
      where: { deletedAt: null },
    });
  }
}

export const schoolRepository = new PrismaSchoolRepository();
