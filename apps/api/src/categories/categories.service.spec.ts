import { NotFoundException } from "@nestjs/common";
import { CategoriesService } from "./categories.service";

describe("CategoriesService", () => {
  let service: CategoriesService;
  const prisma = {
    category: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CategoriesService(prisma as any);
  });

  it("findAll should query active categories only", async () => {
    prisma.category.findMany.mockResolvedValue([{ id: 1 }]);

    const result = await service.findAll();

    expect(prisma.category.findMany).toHaveBeenCalledWith({
      where: { isActive: true, deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        sortOrder: true,
        _count: {
          select: { products: { where: { isActive: true, deletedAt: null } } },
        },
      },
    });
    expect(result).toEqual([{ id: 1 }]);
  });

  it("findOne should return category when found", async () => {
    prisma.category.findFirst.mockResolvedValue({ id: 3, name: "Snack" });

    const result = await service.findOne(3);

    expect(prisma.category.findFirst).toHaveBeenCalledWith({
      where: { id: 3, isActive: true, deletedAt: null },
      include: {
        _count: {
          select: { products: { where: { isActive: true, deletedAt: null } } },
        },
      },
    });
    expect(result).toEqual({ id: 3, name: "Snack" });
  });

  it("findOne should throw NotFoundException when missing", async () => {
    prisma.category.findFirst.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
