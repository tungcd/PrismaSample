import { ClientConfigController } from "../../src/client-config/client-config.controller";

describe("ClientConfigController", () => {
  let controller: ClientConfigController;

  beforeEach(() => {
    controller = new ClientConfigController();
  });

  it("getClientBootstrap should return bootstrap config", () => {
    const result = controller.getClientBootstrap();

    expect(result).toEqual(
      expect.objectContaining({
        appVersion: expect.any(String),
        maintenanceMode: expect.any(Boolean),
        featureFlags: expect.objectContaining({
          vouchers: expect.any(Boolean),
          reports: expect.any(Boolean),
          topUpRequests: expect.any(Boolean),
        }),
      }),
    );
  });
});
