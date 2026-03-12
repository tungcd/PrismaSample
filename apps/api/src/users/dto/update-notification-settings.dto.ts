import { IsBoolean, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class ChannelSettingsDto {
  @IsOptional()
  @IsBoolean()
  orderStatus?: boolean;

  @IsOptional()
  @IsBoolean()
  lowBalance?: boolean;

  @IsOptional()
  @IsBoolean()
  promotions?: boolean;
}

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelSettingsDto)
  push?: ChannelSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelSettingsDto)
  email?: ChannelSettingsDto;
}
