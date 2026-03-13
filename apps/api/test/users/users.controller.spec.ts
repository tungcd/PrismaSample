import { Role } from "@prisma/client";
import { UsersController } from "../../src/users/users.controller";
import { UsersService } from "../../src/users/users.service";

describe("UsersController", () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(() => {
    service = {
      findById: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      getNotificationSettings: jest.fn(),
      updateNotificationSettings: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    controller = new UsersController(service);
  });

  it("getProfile should call findById", async () => {
    service.findById.mockResolvedValue({ id: 1 } as any);

    await expect(controller.getProfile({ id: 1 })).resolves.toEqual({ id: 1 });
    expect(service.findById).toHaveBeenCalledWith(1);
  });

  it("changePassword should pass dto fields", async () => {
    service.changePassword.mockResolvedValue({ success: true } as any);

    await expect(
      controller.changePassword({ id: 1 }, {
        currentPassword: "old",
        newPassword: "new",
      } as any),
    ).resolves.toEqual({ success: true });

    expect(service.changePassword).toHaveBeenCalledWith(1, "old", "new");
  });

  it("getAllUsers should call service", async () => {
    service.findAll.mockResolvedValue([{ id: 1, role: Role.ADMIN }] as any);

    await expect(controller.getAllUsers()).resolves.toEqual([
      { id: 1, role: Role.ADMIN },
    ]);
  });

  it("updateProfile should pass dto", async () => {
    service.updateProfile.mockResolvedValue({ id: 1, name: "New" } as any);

    await expect(
      controller.updateProfile({ id: 1 }, { name: "New" } as any),
    ).resolves.toEqual({ id: 1, name: "New" });
    expect(service.updateProfile).toHaveBeenCalledWith(1, { name: "New" });
  });

  it("getNotificationSettings should call service", async () => {
    service.getNotificationSettings.mockResolvedValue({ push: {} } as any);

    await expect(
      controller.getNotificationSettings({ id: 1 }),
    ).resolves.toEqual({
      push: {},
    });
    expect(service.getNotificationSettings).toHaveBeenCalledWith(1);
  });

  it("updateNotificationSettings should call service", async () => {
    service.updateNotificationSettings.mockResolvedValue({
      success: true,
    } as any);

    await expect(
      controller.updateNotificationSettings({ id: 1 }, {
        push: { promotions: true },
      } as any),
    ).resolves.toEqual({ success: true });
    expect(service.updateNotificationSettings).toHaveBeenCalledWith(1, {
      push: { promotions: true },
    });
  });
});
