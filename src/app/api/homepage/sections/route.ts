import { landingService } from "@/lib/services/landing-service";
import { successResponse, errorResponse } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const data = await landingService.getHomepageSections();
    return successResponse(data);
  } catch (error) {
    logger.error("Get homepage sections error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
