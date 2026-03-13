import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { StudentsModule } from "./students/students.module";
import { CategoriesModule } from "./categories/categories.module";
import { ProductsModule } from "./products/products.module";
import { CartModule } from "./cart/cart.module";
import { OrdersModule } from "./orders/orders.module";
import { WalletModule } from "./wallet/wallet.module";
import { TopUpRequestsModule } from "./top-up-requests/top-up-requests.module";
import { VouchersModule } from "./vouchers/vouchers.module";
import { PromotionsModule } from "./promotions/promotions.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { ReportsModule } from "./reports/reports.module";
import { HealthModule } from "./health/health.module";
import { ClientConfigModule } from "./client-config/client-config.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    WalletModule,
    TopUpRequestsModule,
    VouchersModule,
    PromotionsModule,
    NotificationsModule,
    ReportsModule,
    HealthModule,
    ClientConfigModule,
  ],
})
export class AppModule {}
