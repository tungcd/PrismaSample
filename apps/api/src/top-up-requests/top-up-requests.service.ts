import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Role, TopUpStatus } from "@smart-canteen/prisma";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTopUpRequestDto } from "./dto/create-top-up-request.dto";

@Injectable()
export class TopUpRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateTopUpRequestDto) {
    return this.prisma.topUpRequest.create({
      data: {
        userId,
        amount: dto.amount,
        proofImage: dto.proofImage,
        notes: dto.notes,
      },
    });
  }

  async findAll(userId: number, role: Role) {
    const where =
      role === Role.ADMIN || role === Role.MANAGER || role === Role.STAFF
        ? {}
        : { userId };

    return this.prisma.topUpRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number, userId: number, role: Role) {
    const request = await this.prisma.topUpRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException("Không tìm thấy yêu cầu nạp tiền");
    }

    if (
      role !== Role.ADMIN &&
      role !== Role.MANAGER &&
      role !== Role.STAFF &&
      request.userId !== userId
    ) {
      throw new NotFoundException("Không tìm thấy yêu cầu nạp tiền");
    }

    return request;
  }

  async cancel(id: number, userId: number) {
    const request = await this.prisma.topUpRequest.findUnique({
      where: { id },
    });
    if (!request || request.userId !== userId) {
      throw new NotFoundException("Không tìm thấy yêu cầu nạp tiền");
    }

    if (request.status !== TopUpStatus.PENDING) {
      throw new BadRequestException("Chỉ có thể hủy yêu cầu đang chờ xử lý");
    }

    return this.prisma.topUpRequest.update({
      where: { id },
      data: {
        status: TopUpStatus.REJECTED,
        adminNotes: "Cancelled by user",
        processedAt: new Date(),
      },
    });
  }
}
