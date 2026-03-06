import { NextRequest } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { eq, and, isNull, avg, count } from "drizzle-orm";
import { toHttps, successResponse, errorResponse } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const withClause: any = {
      category: {
        columns: { id: true, name: true, slug: true },
        with: { parent: { columns: { id: true, name: true, slug: true } } },
      },
      brand: { columns: { id: true, name: true, slug: true } },
      options: {
        orderBy: (opt: any, { asc }: any) => [asc(opt.position)],
        with: {
          values: {
            orderBy: (val: any, { asc }: any) => [asc(val.position)],
          },
        },
      },
      variants: {
        orderBy: (v: any, { asc }: any) => [asc(v.position)],
      },
    };

    let product = await db.query.products.findFirst({
      where: and(eq(products.slug, id), isNull(products.deletedAt)),
      with: withClause,
    });

    if (!product) {
      product = await db.query.products.findFirst({
        where: and(eq(products.id, id), isNull(products.deletedAt)),
        with: withClause,
      });
    }

    if (!product) return errorResponse("Product not found", 404);

    const reviewStats = await db
      .select({ avgRating: avg(reviews.rating), count: count() })
      .from(reviews)
      .where(and(eq(reviews.productId, product.id), eq(reviews.isApproved, true)));

    const stats = reviewStats[0];

    const productData: any = {
      ...product,
      images: (product.images || []).map(toHttps),
      reviewStats: {
        averageRating: Math.round((Number(stats?.avgRating) || 0) * 10) / 10,
        totalReviews: stats?.count || 0,
      },
    };

    // Only include options/variants if product has variants
    if (!product.hasVariants) {
      delete productData.options;
      delete productData.variants;
    }

    return successResponse({ product: productData });
  } catch (error) {
    logger.error("Get product error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
