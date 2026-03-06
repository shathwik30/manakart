import { brandService } from "@/lib/services/brand-service";
import { successResponse, errorResponse } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const data = await brandService.getBrands();
    return successResponse(data);
  } catch (error) {
    logger.error("Get brands error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
