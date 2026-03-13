import { NotFoundException } from "@nestjs/common";
import { NotificationsService } from "../../src/notifications/notifications.service";

describe("NotificationsService", () => {
  let service: NotificationsService;

  const prisma = {
    notification: {
      count: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationsService(prisma as any);
  });

  it("findAll should return paged result", async () => {
    prisma.notification.count.mockResolvedValue(2);
    prisma.notification.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const result = await service.findAll(10, { page: 1, limit: 10 } as any);

    expect(result.meta.total).toBe(2);
    expect(result.data).toHaveLength(2);
  });

  it("markRead should throw when no record updated", async () => {
    prisma.notification.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.markRead(1, 2)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("remove should return success when deleted", async () => {
    prisma.notification.deleteMany.mockResolvedValue({ count: 1 });

    await expect(service.remove(1, 2)).resolves.toEqual({ success: true });
  });

  it("findAll should apply isRead and type filters", async () => {
    prisma.notification.count.mockResolvedValue(0);
    prisma.notification.findMany.mockResolvedValue([]);

    await service.findAll(7, {
      page: 2,
      limit: 5,
      isRead: false,
      type: "INFO",
    } as any);

    expect(prisma.notification.count).toHaveBeenCalledWith({
      where: { userId: 7, isRead: false, type: "INFO" },
    });
    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 }),
    );
  });

  it("markRead should return success when updated", async () => {
    prisma.notification.updateMany.mockResolvedValue({ count: 1 });

    await expect(service.markRead(1, 2)).resolves.toEqual({ success: true });
  });

  it("markAllRead should return affected count", async () => {
    prisma.notification.updateMany.mockResolvedValue({ count: 4 });

    await expect(service.markAllRead(2)).resolves.toEqual({
      success: true,
      affected: 4,
    });
  });

  it("remove should throw when no record deleted", async () => {
    prisma.notification.deleteMany.mockResolvedValue({ count: 0 });

    await expect(service.remove(1, 2)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
