import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { TopUpRequestsController } from "./top-up-requests.controller";
import { TopUpRequestsService } from "./top-up-requests.service";

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [TopUpRequestsController],
  providers: [TopUpRequestsService],
})
export class TopUpRequestsModule {}
