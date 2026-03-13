import { NotificationsController } from "../../src/notifications/notifications.controller";
import { NotificationsService } from "../../src/notifications/notifications.service";

describe("NotificationsController", () => {
  let controller: NotificationsController;
  let service: jest.Mocked<NotificationsService>;

  beforeEach(() => {
    service = {
      findAll: jest.fn(),
      markRead: jest.fn(),
      markAllRead: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<NotificationsService>;

    controller = new NotificationsController(service);
  });

  it("findAll should call service", async () => {
    const query = { page: 1, limit: 10 } as any;
    service.findAll.mockResolvedValue({ data: [], meta: {} } as any);

    await expect(controller.findAll({ id: 2 }, query)).resolves.toEqual({
      data: [],
      meta: {},
    });
    expect(service.findAll).toHaveBeenCalledWith(2, query);
  });

  it("markAllRead should call service", async () => {
    service.markAllRead.mockResolvedValue({
      success: true,
      affected: 3,
    } as any);

    await expect(controller.markAllRead({ id: 3 })).resolves.toEqual({
      success: true,
      affected: 3,
    });
    expect(service.markAllRead).toHaveBeenCalledWith(3);
  });
});
