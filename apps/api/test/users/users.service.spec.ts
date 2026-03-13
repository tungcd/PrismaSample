import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { compare, hash } from "bcrypt";
import { UsersService } from "../../src/users/users.service";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe("UsersService", () => {
  let service: UsersService;

  const prisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService(prisma as any);
  });

  it("findById should return selected user", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: "a@b.com" });

    await expect(service.findById(1)).resolves.toEqual({
      id: 1,
      email: "a@b.com",
    });
  });

  it("findAll should return users list", async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    await expect(service.findAll()).resolves.toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("updateProfile should throw when dto is empty", async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 1 });

    await expect(service.updateProfile(1, {} as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("updateProfile should throw when user not found", async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(
      service.updateProfile(1, { name: "X" } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("changePassword should throw when current password wrong", async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 1, passwordHash: "hash" });
    (compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.changePassword(1, "old", "new"),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("changePassword should throw when user not found", async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(
      service.changePassword(1, "old", "new"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("changePassword should throw when new password same as old", async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 1, passwordHash: "hash" });
    (compare as jest.Mock)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);

    await expect(
      service.changePassword(1, "old", "old"),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("changePassword should update hash when valid", async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 1, passwordHash: "hash" });
    (compare as jest.Mock)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    (hash as jest.Mock).mockResolvedValue("new-hash");

    const result = await service.changePassword(1, "old", "new");

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: { passwordHash: "new-hash" },
      }),
    );
    expect(result.success).toBe(true);
  });

  it("notification settings methods should return stub payload", async () => {
    const settings = await service.getNotificationSettings(1);
    const update = await service.updateNotificationSettings(1, {
      push: { orderStatus: false },
    } as any);

    expect(settings).toHaveProperty("push");
    expect(update.success).toBe(true);
    expect(update.settings).toEqual({ push: { orderStatus: false } });
  });

  it("updateProfile should update when payload valid", async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 1 });
    prisma.user.update.mockResolvedValue({ id: 1, name: "New Name" });

    await expect(
      service.updateProfile(1, { name: "New Name" } as any),
    ).resolves.toEqual({ id: 1, name: "New Name" });
  });
});
