import { dealService } from "@/lib/services/deal-service";
import { successResponse, errorResponse } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const data = await dealService.getActiveDeals();
    return successResponse(data);
  } catch (error) {
    logger.error("Get deals error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
