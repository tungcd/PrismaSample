import { CartController } from "../../src/cart/cart.controller";
import { CartService } from "../../src/cart/cart.service";

describe("CartController", () => {
  let controller: CartController;
  let service: jest.Mocked<CartService>;

  beforeEach(() => {
    service = {
      getCartWithDetails: jest.fn(),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
      validateCart: jest.fn(),
      getRawItems: jest.fn(),
    } as unknown as jest.Mocked<CartService>;

    controller = new CartController(service);
  });

  it("getCart should return cart details", async () => {
    service.getCartWithDetails.mockResolvedValue({
      items: [],
      total: 0,
      itemCount: 0,
    } as any);

    await expect(controller.getCart({ id: 1 })).resolves.toEqual({
      items: [],
      total: 0,
      itemCount: 0,
    });
    expect(service.getCartWithDetails).toHaveBeenCalledWith(1);
  });

  it("addItem should add then return cart", async () => {
    service.getCartWithDetails.mockResolvedValue({
      items: [{ productId: 1 }],
      total: 10,
      itemCount: 1,
    } as any);

    const result = await controller.addItem(
      { id: 1 },
      { productId: 1, quantity: 1 },
    );

    expect(service.addItem).toHaveBeenCalledWith(1, 1, 1, undefined);
    expect(result).toEqual({
      items: [{ productId: 1 }],
      total: 10,
      itemCount: 1,
    });
  });

  it("clearCart should clear and return success", async () => {
    await expect(controller.clearCart({ id: 1 })).resolves.toEqual({
      success: true,
      message: "Đã xóa giỏ hàng",
    });
    expect(service.clearCart).toHaveBeenCalledWith(1);
  });
});
