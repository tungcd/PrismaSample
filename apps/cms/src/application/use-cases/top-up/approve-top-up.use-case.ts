import { PrismaTopUpRepository } from "@/infrastructure/database/repositories/top-up.repository";
import { TopUpEntity } from "@/domain/entities/top-up.entity";
import { ApproveTopUpDTO } from "@/domain/repositories/top-up.repository.interface";
import { prisma } from "@/lib/prisma";

// Use internal Docker network address for server-side API calls
const API_URL = process.env.API_URL || "http://api:4000";

export async function approveTopUpUseCase(
  id: number,
  data: ApproveTopUpDTO,
): Promise<TopUpEntity> {
  const repository = new PrismaTopUpRepository();
  const topUpRequest = await repository.approve(id, data);

  // Get updated wallet balance
  const wallet = await prisma.wallet.findUnique({
    where: { userId: topUpRequest.userId },
  });

  // Send notification to parent user
  try {
    const formattedAmount = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(topUpRequest.amount);

    await fetch(`${API_URL}/api/v1/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: topUpRequest.userId,
        title: "✅ Nạp tiền thành công",
        message: `Yêu cầu nạp ${formattedAmount} đã được phê duyệt. Số dư ví của bạn đã được cập nhật!`,
        type: "TOP_UP_APPROVED",
        priority: "HIGH",
        metadata: {
          topUpRequestId: topUpRequest.id,
          amount: topUpRequest.amount,
          newWalletBalance: wallet ? Number(wallet.balance) : null,
          refetchData: ["wallet", "topUpRequests"],
        },
      }),
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
    // Don't fail the whole operation if notification fails
  }

  return topUpRequest;
}
