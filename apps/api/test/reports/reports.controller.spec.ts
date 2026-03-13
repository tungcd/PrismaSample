import { ReportsController } from "../../src/reports/reports.controller";
import { ReportsService } from "../../src/reports/reports.service";

describe("ReportsController", () => {
  let controller: ReportsController;
  let service: jest.Mocked<ReportsService>;

  beforeEach(() => {
    service = {
      spendingSummary: jest.fn(),
      studentConsumption: jest.fn(),
      nutritionOverview: jest.fn(),
    } as unknown as jest.Mocked<ReportsService>;

    controller = new ReportsController(service);
  });

  it("spendingSummary should call service", async () => {
    service.spendingSummary.mockResolvedValue({ total: 100 } as any);

    await expect(
      controller.spendingSummary({ id: 1 }, {} as any),
    ).resolves.toEqual({
      total: 100,
    });
    expect(service.spendingSummary).toHaveBeenCalledWith(1, {});
  });

  it("nutritionOverview should call service", async () => {
    service.nutritionOverview.mockResolvedValue({ calories: 200 } as any);

    await expect(
      controller.nutritionOverview({ id: 2 }, {} as any),
    ).resolves.toEqual({
      calories: 200,
    });
    expect(service.nutritionOverview).toHaveBeenCalledWith(2, {});
  });
});
