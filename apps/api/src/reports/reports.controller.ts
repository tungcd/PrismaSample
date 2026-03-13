import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { ReportsService } from "./reports.service";
import { QueryReportsDto } from "./dto/query-reports.dto";

@Controller("reports")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get("spending-summary")
  async spendingSummary(
    @CurrentUser() user: any,
    @Query() query: QueryReportsDto,
  ) {
    return this.reportsService.spendingSummary(user.id, query);
  }

  @Get("student-consumption")
  async studentConsumption(
    @CurrentUser() user: any,
    @Query() query: QueryReportsDto,
  ) {
    return this.reportsService.studentConsumption(user.id, query);
  }

  @Get("nutrition-overview")
  async nutritionOverview(
    @CurrentUser() user: any,
    @Query() query: QueryReportsDto,
  ) {
    return this.reportsService.nutritionOverview(user.id, query);
  }
}
