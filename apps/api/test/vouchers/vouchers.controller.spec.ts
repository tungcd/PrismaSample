import { VouchersController } from "../../src/vouchers/vouchers.controller";
import { VouchersService } from "../../src/vouchers/vouchers.service";

describe("VouchersController", () => {
  let controller: VouchersController;
  let service: jest.Mocked<VouchersService>;

  beforeEach(() => {
    service = {
      getAvailable: jest.fn(),
      validateCode: jest.fn(),
    } as unknown as jest.Mocked<VouchersService>;

    controller = new VouchersController(service);
  });

  it("getAvailable should call service", async () => {
    service.getAvailable.mockResolvedValue([{ id: 1 }] as any);

    await expect(controller.getAvailable()).resolves.toEqual([{ id: 1 }]);
    expect(service.getAvailable).toHaveBeenCalledTimes(1);
  });

  it("validate should pass code and amount", async () => {
    service.validateCode.mockResolvedValue({ valid: true } as any);

    await expect(
      controller.validate({ code: "ABC", amount: 100 } as any),
    ).resolves.toEqual({ valid: true });
    expect(service.validateCode).toHaveBeenCalledWith("ABC", 100);
  });
});
