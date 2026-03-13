import { IsString } from "class-validator";

export class ApplyOrderVoucherDto {
  @IsString()
  code: string;
}
