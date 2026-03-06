import { NextRequest } from "next/server";
import { db } from "@/db";
import { products, brands, categories } from "@/db/schema";
import { eq, and, isNull, desc, count, inArray } from "drizzle-orm";
import { categoryService } from "@/lib/services/category-service";
import { successResponse, errorResponse } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;

    const { category } = await categoryService.getCategoryBySlug(slug);
    if (!category) return errorResponse("Category not found", 404);

    const categoryIds = [category.id, ...category.children.map((c: any) => c.id)];

    const where = and(
      inArray(products.categoryId, categoryIds),
      eq(products.isActive, true),
      isNull(products.deletedAt)
    );

    const [productRows, countResult] = await Promise.all([
      db.query.products.findMany({
        where,
        orderBy: [desc(products.createdAt)],
        limit,
        offset,
        with: {
          brand: { columns: { id: true, name: true, slug: true } },
          category: { columns: { id: true, name: true, slug: true } },
        },
      }),
      db.select({ count: count() }).from(products).where(where),
    ]);

    const totalCount = countResult[0]?.count ?? 0;

    return successResponse({
      category,
      products: productRows,
      pagination: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) },
    });
  } catch (error) {
    logger.error("Get category by slug error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
