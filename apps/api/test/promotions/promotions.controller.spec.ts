import { PromotionsController } from "../../src/promotions/promotions.controller";

describe("PromotionsController", () => {
  let controller: PromotionsController;

  beforeEach(() => {
    controller = new PromotionsController();
  });

  it("getBanners should return banners", async () => {
    const result = await controller.getBanners();

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: expect.any(String),
      }),
    );
  });
});
