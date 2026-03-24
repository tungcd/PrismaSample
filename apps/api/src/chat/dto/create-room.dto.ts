import { IsEnum, IsOptional, IsString, IsArray, IsNumber, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { RoomType } from '@smart-canteen/prisma';

export class CreateRoomDto {
  @IsEnum(RoomType)
  type: RoomType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(1) // Phase 1: Only 1 other member for DIRECT chat
  memberIds: number[];
}
