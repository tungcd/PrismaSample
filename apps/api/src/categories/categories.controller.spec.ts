import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";

describe("CategoriesController", () => {
  let controller: CategoriesController;
  let service: jest.Mocked<CategoriesService>;

  beforeEach(() => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<CategoriesService>;

    controller = new CategoriesController(service);
  });

  it("should return all categories", async () => {
    const categories = [{ id: 1, name: "Drinks" }];
    service.findAll.mockResolvedValue(categories as any);

    await expect(controller.findAll()).resolves.toEqual(categories);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it("should return one category by id", async () => {
    const category = { id: 2, name: "Food" };
    service.findOne.mockResolvedValue(category as any);

    await expect(controller.findOne(2)).resolves.toEqual(category);
    expect(service.findOne).toHaveBeenCalledWith(2);
  });
});
