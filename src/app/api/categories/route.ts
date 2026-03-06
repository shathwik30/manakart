import { NextRequest } from "next/server";
import { categoryService } from "@/lib/services/category-service";
import { successResponse, errorResponse } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nav = searchParams.get("nav") === "true";

    const data = await categoryService.getCategories({ nav });
    return successResponse(data);
  } catch (error) {
    logger.error("Get categories error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
