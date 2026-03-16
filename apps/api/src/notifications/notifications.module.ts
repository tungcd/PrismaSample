import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { WebSocketsModule } from "../websockets/websockets.module";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";

@Module({
  imports: [PrismaModule, WebSocketsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService], // Export for other modules to use
})
export class NotificationsModule {}
