import { PrismaTopUpRepository } from "@/infrastructure/database/repositories/top-up.repository";
import { TopUpEntity } from "@/domain/entities/top-up.entity";
import { RejectTopUpDTO } from "@/domain/repositories/top-up.repository.interface";

// Use internal Docker network address for server-side API calls
const API_URL = process.env.API_URL || "http://api:4000";

export async function rejectTopUpUseCase(
  id: number,
  data: RejectTopUpDTO,
): Promise<TopUpEntity> {
  const repository = new PrismaTopUpRepository();
  const topUpRequest = await repository.reject(id, data);

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
        title: "❌ Yêu cầu nạp tiền bị từ chối",
        message: `Yêu cầu nạp ${formattedAmount} đã bị từ chối. Lý do: ${data.adminNotes || "Không rõ"}`,
        type: "TOP_UP_REJECTED",
        priority: "NORMAL",
        metadata: {
          topUpRequestId: topUpRequest.id,
          amount: topUpRequest.amount,
          reason: data.adminNotes,
          refetchData: ["topUpRequests"],
        },
      }),
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
    // Don't fail the whole operation if notification fails
  }

  return topUpRequest;
}
