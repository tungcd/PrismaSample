import { IProductRepository } from "@/domain/repositories/product.repository.interface";
import { prisma } from "../prisma-client";
import { ProductEntity } from "@/domain/entities/product.entity";

export class PrismaProductRepository implements IProductRepository {
  async findAll(): Promise<ProductEntity[]> {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      images: product.images,
      categoryId: product.categoryId,
      isActive: product.isActive,
      createdAt: product.createdAt,
      category: product.category,
    }));
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
      isActive: product.isActive,
      createdAt: product.createdAt,
      category: product.category,
    };
  }

  async count(): Promise<number> {
    return prisma.product.count({
      where: { deletedAt: null },
    });
  }
}

export const productRepository = new PrismaProductRepository();
