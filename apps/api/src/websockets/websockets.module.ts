import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { WebSocketsGateway } from "./websockets.gateway";
import { NotificationGateway } from "./notification.gateway";
import { WsAuthGuard } from "./ws-auth.guard";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key",
      signOptions: { expiresIn: "7d" },
    }),
  ],
  providers: [WebSocketsGateway, NotificationGateway, WsAuthGuard],
  exports: [WebSocketsGateway, NotificationGateway],
})
export class WebSocketsModule {}
