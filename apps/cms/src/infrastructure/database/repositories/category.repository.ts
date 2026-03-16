import { prisma } from "@/lib/prisma";
import {
  ICategoryRepository,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  FindCategoriesParams,
} from "@/domain/repositories/category.repository.interface";
import { CategoryEntity } from "@/domain/entities/category.entity";
import { Prisma } from "@smart-canteen/prisma";

export class PrismaCategoryRepository implements ICategoryRepository {
  async findMany(
    params: FindCategoriesParams = {},
  ): Promise<{ categories: CategoryEntity[]; total: number }> {
    const {
      page = 1,
      pageSize = 10,
      name,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const where: Prisma.CategoryWhereInput = {
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

    const orderBy: Prisma.CategoryOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const skip = (page - 1) * pageSize;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.category.count({ where }),
    ]);

    return {
      categories: categories as CategoryEntity[],
      total,
    };
  }

  async findById(id: number): Promise<CategoryEntity | null> {
    const category = await prisma.category.findUnique({
      where: { id, deletedAt: null },
    });

    return category as CategoryEntity | null;
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const category = await prisma.category.findUnique({
      where: { slug, deletedAt: null },
    });

    return category as CategoryEntity | null;
  }

  async create(data: CreateCategoryDTO): Promise<CategoryEntity> {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    return category as CategoryEntity;
  }

  async update(id: number, data: UpdateCategoryDTO): Promise<CategoryEntity> {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });

    return category as CategoryEntity;
  }

  async delete(id: number): Promise<void> {
    await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async toggleActive(id: number): Promise<CategoryEntity> {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive },
    });

    return updated as CategoryEntity;
  }

  async count(): Promise<number> {
    return prisma.category.count({
      where: { deletedAt: null },
    });
  }
}

export const categoryRepository = new PrismaCategoryRepository();
