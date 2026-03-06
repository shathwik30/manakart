import { NextRequest } from "next/server";
import { productService } from "@/lib/services/product-service";
import { successResponse, errorResponse } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const brandId = searchParams.get("brandId") || undefined;
    const search = searchParams.get("search") || undefined;
    const sort = searchParams.get("sort") || undefined;
    const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined;
    const active = searchParams.get("active") !== "false";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    // Resolve parent category into child IDs
    let categoryIds: string[] | undefined;
    if (categoryId) {
      const childCategories = await db.query.categories.findMany({
        where: eq(categories.parentId, categoryId),
        columns: { id: true },
      });
      if (childCategories.length > 0) {
        categoryIds = [categoryId, ...childCategories.map((c) => c.id)];
      }
    }

    const data = await productService.getProducts({
      categoryId: categoryIds ? undefined : categoryId,
      categoryIds,
      brandId,
      search,
      sort,
      minPrice,
      maxPrice,
      isActive: active ? true : undefined,
      page,
      limit,
    });

    return successResponse(data);
  } catch (error) {
    logger.error("Get products error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
