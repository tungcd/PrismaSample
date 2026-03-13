import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";

describe("ProductsController", () => {
  let controller: ProductsController;
  let service: jest.Mocked<ProductsService>;

  beforeEach(() => {
    service = {
      findAll: jest.fn(),
      findFeatured: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<ProductsService>;

    controller = new ProductsController(service);
  });

  it("should return paged products", async () => {
    const output = {
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    };
    service.findAll.mockResolvedValue(output as any);
    const query = { page: 1, limit: 20 } as any;

    await expect(controller.findAll(query)).resolves.toEqual(output);
    expect(service.findAll).toHaveBeenCalledWith(query);
  });

  it("should return featured products", async () => {
    service.findFeatured.mockResolvedValue([{ id: 10 }] as any);

    await expect(controller.findFeatured()).resolves.toEqual([{ id: 10 }]);
    expect(service.findFeatured).toHaveBeenCalledTimes(1);
  });

  it("should return one product", async () => {
    service.findOne.mockResolvedValue({ id: 7 } as any);

    await expect(controller.findOne(7)).resolves.toEqual({ id: 7 });
    expect(service.findOne).toHaveBeenCalledWith(7);
  });
});
