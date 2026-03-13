import { Controller, Get } from "@nestjs/common";

@Controller("config")
export class ClientConfigController {
  @Get("client-bootstrap")
  getClientBootstrap() {
    return {
      appVersion: process.env.APP_VERSION ?? "1.0.0",
      maintenanceMode: process.env.MAINTENANCE_MODE === "true",
      featureFlags: {
        vouchers: true,
        reports: true,
        topUpRequests: true,
      },
      updatedAt: new Date().toISOString(),
    };
  }
}
