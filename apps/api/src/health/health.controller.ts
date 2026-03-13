import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: "ok",
      service: "smart-canteen-api",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
