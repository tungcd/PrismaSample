import {
  IProductRepository,
  FindProductsParams,
  CreateProductDTO,
  UpdateProductDTO,
} from "@/domain/repositories/product.repository.interface";
import { prisma } from "../prisma-client";
import { ProductEntity } from "@/domain/entities/product.entity";
import { Prisma } from "@smart-canteen/prisma";

export class PrismaProductRepository implements IProductRepository {
  async findMany(
    params: FindProductsParams = {},
  ): Promise<{ products: ProductEntity[]; total: number }> {
    const {
      page = 1,
      pageSize = 10,
      name,
      categoryId,
      minPrice,
      maxPrice,
      stock,
      status,
      isFeatured,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    // Filter by name
    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }

    // Filter by category
    if (categoryId && categoryId !== "all") {
      where.categoryId = parseInt(categoryId);
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Filter by stock
    if (stock && stock !== "all") {
      if (stock === "out_of_stock") {
        where.stock = { lte: 0 };
      } else if (stock === "low_stock") {
        where.stock = { gt: 0, lte: 10 };
      } else if (stock === "in_stock") {
        where.stock = { gt: 10 };
      }
    }

    //Filter by status
    if (status && status !== "all") {
      where.isActive = status === "active";
    }

    // Filter by featured
    if (isFeatured && isFeatured !== "all") {
      where.isFeatured = isFeatured === "true";
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: Number(product.price),
        stock: product.stock,
        images: product.images,
        categoryId: product.categoryId,
        supplierId: product.supplierId,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        calories: product.calories,
        protein: product.protein ? Number(product.protein) : null,
        carbs: product.carbs ? Number(product.carbs) : null,
        fat: product.fat ? Number(product.fat) : null,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        deletedAt: product.deletedAt,
        category: product.category,
        supplier: product.supplier,
      })),
      total,
    };
  }

  async findById(id: number): Promise<ProductEntity | null> {
    const product = await prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      images: product.images,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      calories: product.calories,
      protein: product.protein ? Number(product.protein) : null,
      carbs: product.carbs ? Number(product.carbs) : null,
      fat: product.fat ? Number(product.fat) : null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
      category: product.category,
      supplier: product.supplier,
    };
  }

  async findBySlug(slug: string): Promise<ProductEntity | null> {
    const product = await prisma.product.findUnique({
      where: { slug, deletedAt: null },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      images: product.images,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      calories: product.calories,
      protein: product.protein ? Number(product.protein) : null,
      carbs: product.carbs ? Number(product.carbs) : null,
      fat: product.fat ? Number(product.fat) : null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
      category: product.category,
      supplier: product.supplier,
    };
  }

  async create(data: CreateProductDTO): Promise<ProductEntity> {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        stock: data.stock ?? 0,
        images: data.images ?? [],
        categoryId: data.categoryId,
        supplierId: data.supplierId,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      images: product.images,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      calories: product.calories,
      protein: product.protein ? Number(product.protein) : null,
      carbs: product.carbs ? Number(product.carbs) : null,
      fat: product.fat ? Number(product.fat) : null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
      category: product.category,
      supplier: product.supplier,
    };
  }

  async update(id: number, data: UpdateProductDTO): Promise<ProductEntity> {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        stock: data.stock,
        images: data.images,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      images: product.images,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      calories: product.calories,
      protein: product.protein ? Number(product.protein) : null,
      carbs: product.carbs ? Number(product.carbs) : null,
      fat: product.fat ? Number(product.fat) : null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
      category: product.category,
      supplier: product.supplier,
    };
  }

  async delete(id: number): Promise<void> {
    // Soft delete
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async toggleActive(id: number): Promise<ProductEntity> {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      price: Number(updated.price),
      stock: updated.stock,
      images: updated.images,
      categoryId: updated.categoryId,
      supplierId: updated.supplierId,
      isActive: updated.isActive,
      isFeatured: updated.isFeatured,
      calories: updated.calories,
      protein: updated.protein ? Number(updated.protein) : null,
      carbs: updated.carbs ? Number(updated.carbs) : null,
      fat: updated.fat ? Number(updated.fat) : null,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      deletedAt: updated.deletedAt,
      category: updated.category,
      supplier: updated.supplier,
    };
  }

  async count(): Promise<number> {
    return prisma.product.count({
      where: { deletedAt: null },
    });
  }
}

export const productRepository = new PrismaProductRepository();
