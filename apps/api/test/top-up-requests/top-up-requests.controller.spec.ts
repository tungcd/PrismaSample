import { Role } from "@prisma/client";
import { TopUpRequestsController } from "../../src/top-up-requests/top-up-requests.controller";
import { TopUpRequestsService } from "../../src/top-up-requests/top-up-requests.service";

describe("TopUpRequestsController", () => {
  let controller: TopUpRequestsController;
  let service: jest.Mocked<TopUpRequestsService>;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      cancel: jest.fn(),
    } as unknown as jest.Mocked<TopUpRequestsService>;

    controller = new TopUpRequestsController(service);
  });

  it("create should call service", async () => {
    service.create.mockResolvedValue({ id: 1 } as any);

    await expect(
      controller.create({ id: 10 }, { amount: 5000 } as any),
    ).resolves.toEqual({
      id: 1,
    });
    expect(service.create).toHaveBeenCalledWith(10, { amount: 5000 });
  });

  it("findAll should call service with role", async () => {
    service.findAll.mockResolvedValue([{ id: 1 }] as any);

    await expect(
      controller.findAll({ id: 1, role: Role.PARENT }),
    ).resolves.toEqual([{ id: 1 }]);
    expect(service.findAll).toHaveBeenCalledWith(1, Role.PARENT);
  });
});
