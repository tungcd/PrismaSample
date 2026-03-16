import { Role } from "@smart-canteen/prisma";
import { OrdersController } from "../../src/orders/orders.controller";
import { OrdersService } from "../../src/orders/orders.service";

describe("OrdersController", () => {
  let controller: OrdersController;
  let service: jest.Mocked<OrdersService>;

  beforeEach(() => {
    service = {
      createOrder: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      cancelOrder: jest.fn(),
      getTracking: jest.fn(),
      reorder: jest.fn(),
      applyVoucher: jest.fn(),
      removeVoucher: jest.fn(),
    } as unknown as jest.Mocked<OrdersService>;

    controller = new OrdersController(service);
  });

  it("createOrder should pass user id and dto", async () => {
    const dto = { items: [{ productId: 1, quantity: 2 }] } as any;
    service.createOrder.mockResolvedValue({ id: 1 } as any);

    await expect(controller.createOrder({ id: 11 }, dto)).resolves.toEqual({
      id: 1,
    });
    expect(service.createOrder).toHaveBeenCalledWith(11, dto);
  });

  it("findAll should pass user context and query", async () => {
    const user = { id: 2, role: Role.PARENT };
    const query = { page: 1, limit: 10 } as any;
    service.findAll.mockResolvedValue({ data: [], meta: {} } as any);

    await expect(controller.findAll(user, query)).resolves.toEqual({
      data: [],
      meta: {},
    });
    expect(service.findAll).toHaveBeenCalledWith(2, Role.PARENT, query);
  });

  it("findOne should pass id, userId and role", async () => {
    service.findOne.mockResolvedValue({ id: 99 } as any);

    await expect(
      controller.findOne({ id: 3, role: Role.ADMIN }, 99),
    ).resolves.toEqual({ id: 99 });
    expect(service.findOne).toHaveBeenCalledWith(99, 3, Role.ADMIN);
  });

  it("cancelOrder should call service", async () => {
    service.cancelOrder.mockResolvedValue({
      id: 1,
      status: "CANCELLED",
    } as any);

    await expect(
      controller.cancelOrder({ id: 3, role: Role.PARENT }, 1),
    ).resolves.toEqual({ id: 1, status: "CANCELLED" });
    expect(service.cancelOrder).toHaveBeenCalledWith(1, 3, Role.PARENT);
  });

  it("getTracking should call service", async () => {
    service.getTracking.mockResolvedValue({ orderId: 1, events: [] } as any);

    await expect(
      controller.getTracking({ id: 3, role: Role.PARENT }, 1),
    ).resolves.toEqual({
      orderId: 1,
      events: [],
    });
    expect(service.getTracking).toHaveBeenCalledWith(1, 3, Role.PARENT);
  });

  it("reorder should call service", async () => {
    service.reorder.mockResolvedValue({ id: 2 } as any);

    await expect(
      controller.reorder({ id: 3, role: Role.PARENT }, 1),
    ).resolves.toEqual({
      id: 2,
    });
    expect(service.reorder).toHaveBeenCalledWith(1, 3, Role.PARENT);
  });

  it("applyVoucher should call service", async () => {
    service.applyVoucher.mockResolvedValue({ success: true } as any);

    await expect(
      controller.applyVoucher({ id: 3, role: Role.PARENT }, 1, {
        code: "ABC",
      } as any),
    ).resolves.toEqual({ success: true });
    expect(service.applyVoucher).toHaveBeenCalledWith(1, 3, Role.PARENT, "ABC");
  });

  it("removeVoucher should call service", async () => {
    service.removeVoucher.mockResolvedValue({ success: true } as any);

    await expect(
      controller.removeVoucher({ id: 3, role: Role.PARENT }, 1),
    ).resolves.toEqual({ success: true });
    expect(service.removeVoucher).toHaveBeenCalledWith(1, 3, Role.PARENT);
  });
});
