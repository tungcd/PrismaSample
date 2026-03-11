import { NextResponse } from "next/server";
import { getAllUsersUseCase } from "@/application/use-cases/user/get-all-users.use-case";
import { requireAuth } from "@/lib/auth-server";

/**
 * GET /api/parents - Get all parent users
 * Authentication: Required (all authenticated users can access)
 * Used by: InfiniteSelectBox for parent selection
 */
export async function GET() {
  try {
    // Verify authentication via JWT token from cookies
    const authUser = await requireAuth();

    const users = await getAllUsersUseCase.execute();
    // Filter only parents
    const parents = users.filter((user) => user.role === "PARENT");
    return NextResponse.json(parents);
  } catch (error: any) {
    // Handle authentication errors
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch parents" },
      { status: 500 },
    );
  }
}
