import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Role, TopUpStatus } from "@smart-canteen/prisma";
import { TopUpRequestsService } from "../../src/top-up-requests/top-up-requests.service";

describe("TopUpRequestsService", () => {
  let service: TopUpRequestsService;

  const prisma = {
    topUpRequest: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TopUpRequestsService(prisma as any);
  });

  it("findAll should return all for admin", async () => {
    prisma.topUpRequest.findMany.mockResolvedValue([{ id: 1 }]);

    await service.findAll(10, Role.ADMIN);

    expect(prisma.topUpRequest.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: "desc" },
    });
  });

  it("findOne should throw when request not found", async () => {
    prisma.topUpRequest.findUnique.mockResolvedValue(null);

    await expect(service.findOne(1, 2, Role.PARENT)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("cancel should throw when status not pending", async () => {
    prisma.topUpRequest.findUnique.mockResolvedValue({
      id: 1,
      userId: 2,
      status: TopUpStatus.APPROVED,
    });

    await expect(service.cancel(1, 2)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("cancel should update pending request", async () => {
    prisma.topUpRequest.findUnique.mockResolvedValue({
      id: 1,
      userId: 2,
      status: TopUpStatus.PENDING,
    });
    prisma.topUpRequest.update.mockResolvedValue({
      id: 1,
      status: TopUpStatus.REJECTED,
    });

    const result = await service.cancel(1, 2);

    expect(prisma.topUpRequest.update).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, status: TopUpStatus.REJECTED });
  });

  it("create should persist request payload", async () => {
    prisma.topUpRequest.create.mockResolvedValue({ id: 9 });

    await service.create(2, {
      amount: 10000,
      proofImage: "img",
      notes: "note",
    } as any);

    expect(prisma.topUpRequest.create).toHaveBeenCalledWith({
      data: {
        userId: 2,
        amount: 10000,
        proofImage: "img",
        notes: "note",
      },
    });
  });

  it("findAll should scope by user for parent role", async () => {
    prisma.topUpRequest.findMany.mockResolvedValue([]);

    await service.findAll(44, Role.PARENT);

    expect(prisma.topUpRequest.findMany).toHaveBeenCalledWith({
      where: { userId: 44 },
      orderBy: { createdAt: "desc" },
    });
  });

  it("findOne should hide request of another user", async () => {
    prisma.topUpRequest.findUnique.mockResolvedValue({ id: 1, userId: 99 });

    await expect(service.findOne(1, 2, Role.PARENT)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("cancel should throw when request not found", async () => {
    prisma.topUpRequest.findUnique.mockResolvedValue(null);

    await expect(service.cancel(1, 2)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("cancel should throw when request belongs to another user", async () => {
    prisma.topUpRequest.findUnique.mockResolvedValue({
      id: 1,
      userId: 10,
      status: TopUpStatus.PENDING,
    });

    await expect(service.cancel(1, 2)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
