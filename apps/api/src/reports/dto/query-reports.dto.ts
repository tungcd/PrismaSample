import { Type } from "class-transformer";
import { IsDateString, IsInt, IsOptional } from "class-validator";

export class QueryReportsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  studentId?: number;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
