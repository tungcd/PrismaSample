import { NotFoundException } from "@nestjs/common";
import { ProductsService } from "./products.service";

describe("ProductsService", () => {
  let service: ProductsService;
  const prisma = {
    product: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProductsService(prisma as any);
  });

  it("findAll should apply filters and pagination", async () => {
    prisma.product.count.mockResolvedValue(1);
    prisma.product.findMany.mockResolvedValue([{ id: 1, name: "Milk" }]);

    const result = await service.findAll({
      categoryId: 2,
      search: "mil",
      featured: true,
      page: 2,
      limit: 10,
    });

    expect(prisma.product.count).toHaveBeenCalledWith({
      where: {
        isActive: true,
        deletedAt: null,
        categoryId: 2,
        isFeatured: true,
        OR: [
          { name: { contains: "mil", mode: "insensitive" } },
          { description: { contains: "mil", mode: "insensitive" } },
        ],
      },
    });

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );

    expect(result.meta).toEqual({
      total: 1,
      page: 2,
      limit: 10,
      totalPages: 1,
    });
  });

  it("findFeatured should query only active featured products", async () => {
    prisma.product.findMany.mockResolvedValue([{ id: 2 }]);

    const result = await service.findFeatured();

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true, isFeatured: true, deletedAt: null },
      }),
    );
    expect(result).toEqual([{ id: 2 }]);
  });

  it("findOne should throw when product not found", async () => {
    prisma.product.findFirst.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
