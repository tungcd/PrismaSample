import { prisma } from "@/lib/prisma";
import {
  ISupplierRepository,
  CreateSupplierDTO,
  UpdateSupplierDTO,
  FindSuppliersParams,
} from "@/domain/repositories/supplier.repository.interface";
import { SupplierEntity } from "@/domain/entities/supplier.entity";
import { Prisma } from "@smart-canteen/prisma";

export class PrismaSupplierRepository implements ISupplierRepository {
  async findMany(
    params: FindSuppliersParams = {},
  ): Promise<{ suppliers: SupplierEntity[]; total: number }> {
    const {
      page = 1,
      pageSize = 10,
      name,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const where: Prisma.SupplierWhereInput = {
      deletedAt: null,
    };

    if (name) {
      where.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    if (status && status !== "all") {
      where.isActive = status === "active";
    }

    const orderBy: Prisma.SupplierOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const skip = (page - 1) * pageSize;

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.supplier.count({ where }),
    ]);

    return {
      suppliers: suppliers as SupplierEntity[],
      total,
    };
  }

  async findById(id: number): Promise<SupplierEntity | null> {
    const supplier = await prisma.supplier.findUnique({
      where: { id, deletedAt: null },
    });

    return supplier as SupplierEntity | null;
  }

  async create(data: CreateSupplierDTO): Promise<SupplierEntity> {
    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        isActive: data.isActive ?? true,
      },
    });

    return supplier as SupplierEntity;
  }

  async update(id: number, data: UpdateSupplierDTO): Promise<SupplierEntity> {
    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        isActive: data.isActive,
      },
    });

    return supplier as SupplierEntity;
  }

  async delete(id: number): Promise<void> {
    await prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async toggleActive(id: number): Promise<SupplierEntity> {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new Error("Supplier not found");
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: { isActive: !supplier.isActive },
    });

    return updated as SupplierEntity;
  }

  async count(): Promise<number> {
    return prisma.supplier.count({
      where: { deletedAt: null },
    });
  }
}

export const supplierRepository = new PrismaSupplierRepository();
