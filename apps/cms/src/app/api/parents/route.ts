import { NextResponse } from "next/server";
import { getAllUsersUseCase } from "@/application/use-cases/user/get-all-users.use-case";

export async function GET() {
  try {
    const users = await getAllUsersUseCase.execute();
    // Filter only parents
    const parents = users.filter((user) => user.role === "PARENT");
    return NextResponse.json(parents);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch parents" },
      { status: 500 },
    );
  }
}
