import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    await clearAuthCookie("admin_token");
    return successResponse({ message: "Logged out successfully" });
  } catch (error) {
    return errorResponse("Failed to logout", 500);
  }
}
