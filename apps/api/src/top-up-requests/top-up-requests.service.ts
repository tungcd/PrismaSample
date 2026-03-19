import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Role,
  TopUpStatus,
  NotificationType,
  NotificationPriority,
} from "@smart-canteen/prisma";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateTopUpRequestDto } from "./dto/create-top-up-request.dto";

@Injectable()
export class TopUpRequestsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: number, dto: CreateTopUpRequestDto) {
    const topUpRequest = await this.prisma.topUpRequest.create({
      data: {
        userId,
        amount: dto.amount,
        proofImage: dto.proofImage,
        notes: dto.notes,
      },
      include: {
        user: true,
      },
    });

    // Notify all admins and managers about new top-up request
    const formattedAmount = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(dto.amount);

    await this.notificationsService.broadcastToRole(Role.ADMIN, {
      title: "💰 Yêu cầu nạp tiền mới",
      message: `${topUpRequest.user.name} đã yêu cầu nạp ${formattedAmount}`,
      type: NotificationType.TOP_UP_REQUEST,
      priority: NotificationPriority.HIGH,
      metadata: {
        topUpRequestId: topUpRequest.id,
        userId: topUpRequest.userId,
        amount: dto.amount,
      },
    });

    await this.notificationsService.broadcastToRole(Role.MANAGER, {
      title: "💰 Yêu cầu nạp tiền mới",
      message: `${topUpRequest.user.name} đã yêu cầu nạp ${formattedAmount}`,
      type: NotificationType.TOP_UP_REQUEST,
      priority: NotificationPriority.HIGH,
      metadata: {
        topUpRequestId: topUpRequest.id,
        userId: topUpRequest.userId,
        amount: dto.amount,
      },
    });

    return topUpRequest;
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
