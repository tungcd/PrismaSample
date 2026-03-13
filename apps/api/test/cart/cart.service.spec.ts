import { CartService } from "../../src/cart/cart.service";

describe("CartService", () => {
  let service: CartService;
  const prisma = {
    product: {
      findMany: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CartService(prisma as any);
  });

  it("addItem should merge quantity for same product and student", () => {
    service.addItem(1, 10, 1, 100);
    service.addItem(1, 10, 2, 100);

    const items = service.getRawItems(1);
    expect(items).toEqual([{ productId: 10, quantity: 3, studentId: 100 }]);
  });

  it("updateItem should remove item when quantity is 0", () => {
    service.addItem(1, 10, 2);
    service.updateItem(1, 10, 0);

    expect(service.getRawItems(1)).toEqual([]);
  });

  it("getCartWithDetails should compute total and itemCount", async () => {
    service.addItem(1, 10, 2);
    prisma.product.findMany.mockResolvedValue([
      {
        id: 10,
        name: "Milk",
        slug: "milk",
        price: 12.5,
        images: [],
        stock: 20,
      },
    ]);

    const result = await service.getCartWithDetails(1);

    expect(result.itemCount).toBe(2);
    expect(result.total).toBe(25);
    expect(result.items[0]).toEqual(
      expect.objectContaining({ productId: 10, quantity: 2, subtotal: 25 }),
    );
  });

  it("validateCart should return issues for missing/insufficient stock", async () => {
    service.addItem(1, 10, 3);
    service.addItem(1, 20, 1);

    prisma.product.findMany.mockResolvedValue([
      { id: 10, name: "Cake", slug: "cake", price: 8, images: [], stock: 1 },
      // product 20 missing => treated as inactive/unavailable
    ]);

    const result = await service.validateCart(1);

    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        "Cake: chỉ còn 1 sản phẩm trong kho",
        "Sản phẩm #20 không còn hoạt động",
      ]),
    );
  });
});
