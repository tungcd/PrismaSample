import { IsString, IsOptional, IsEnum, IsNumber, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MessageContentType } from '@smart-canteen/prisma';

export class AttachmentDto {
  @IsString()
  url: string;

  @IsString()
  fileName: string;

  @IsString()
  fileType: string;

  @IsNumber()
  fileSize: number;
}

export class SendMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(MessageContentType)
  contentType?: MessageContentType;

  @IsOptional()
  @IsNumber()
  replyToId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @IsOptional()
  @IsObject()
  metadata?: any;
}
