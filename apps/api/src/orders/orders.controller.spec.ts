import { Role } from "@prisma/client";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

describe("OrdersController", () => {
  let controller: OrdersController;
  let service: jest.Mocked<OrdersService>;

  beforeEach(() => {
    service = {
      createOrder: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
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
});
