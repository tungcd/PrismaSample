import { HealthController } from "../../src/health/health.controller";

describe("HealthController", () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it("getHealth should return status payload", () => {
    const result = controller.getHealth();

    expect(result.status).toBe("ok");
    expect(result.service).toBe("smart-canteen-api");
    expect(typeof result.timestamp).toBe("string");
    expect(typeof result.uptime).toBe("number");
  });
});
