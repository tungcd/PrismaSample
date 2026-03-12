import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { QueryProductsDto } from "./dto/query-products.dto";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryProductsDto) {
    const { categoryId, search, featured, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, any> = {
      isActive: true,
      deletedAt: null,
    };

    if (categoryId) where.categoryId = categoryId;
    if (featured !== undefined) where.isFeatured = featured;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          stock: true,
          images: true,
          isFeatured: true,
          calories: true,
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findFeatured() {
    return this.prisma.product.findMany({
      where: { isActive: true, isFeatured: true, deletedAt: null },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        stock: true,
        images: true,
        calories: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, isActive: true, deletedAt: null },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        supplier: { select: { id: true, name: true } },
      },
    });

    if (!product) {
      throw new NotFoundException("Không tìm thấy sản phẩm");
    }

    return product;
  }
}
