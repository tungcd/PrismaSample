import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";

@Controller("promotions")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PromotionsController {
  @Get("banners")
  async getBanners() {
    return {
      items: [
        {
          id: "welcome-1",
          title: "Chao mung den voi Smart Canteen",
          imageUrl: "/banners/welcome.jpg",
          actionUrl: "/menu",
        },
      ],
    };
  }
}
