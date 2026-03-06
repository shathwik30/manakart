import { NextRequest } from "next/server";
import { searchService } from "@/lib/services/search-service";
import { successResponse, errorResponse } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    if (!q.trim()) {
      return successResponse({ products: [], pagination: { page: 1, limit: 20, totalCount: 0, totalPages: 0 } });
    }

    const categoryId = searchParams.get("categoryId") || undefined;
    const brandId = searchParams.get("brandId") || undefined;
    const sort = searchParams.get("sort") || undefined;
    const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const data = await searchService.search({ q, categoryId, brandId, sort, minPrice, maxPrice, page, limit });
    return successResponse(data);
  } catch (error) {
    logger.error("Search error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
