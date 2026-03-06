import { NextRequest } from "next/server";
import { reviewService } from "@/lib/services/review-service";
import { getCurrentUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));

    const result = await reviewService.getProductReviews(id, { page, limit });

    return successResponse(result);
  } catch (error) {
    logger.error("Get product reviews error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const body = await request.json();
    const { rating, title, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return errorResponse("Rating must be between 1 and 5", 400);
    }

    const { review } = await reviewService.createReview({
      productId: id,
      userId: user.userId,
      userName: user.email,
      rating,
      title: title || undefined,
      comment: comment || undefined,
    });

    return successResponse({ review });
  } catch (error) {
    logger.error("Create product review error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
