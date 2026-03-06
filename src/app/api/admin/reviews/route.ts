import { NextRequest } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const approved = searchParams.get("approved");
    const featured = searchParams.get("featured");
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (approved === "true") conditions.push(eq(reviews.isApproved, true));
    else if (approved === "false") conditions.push(eq(reviews.isApproved, false));
    if (featured === "true") conditions.push(eq(reviews.isFeatured, true));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [reviewRows, countResult] = await Promise.all([
      db.query.reviews.findMany({
        where, offset, limit, orderBy: [desc(reviews.createdAt)],
        with: {
          product: { columns: { id: true, title: true, slug: true } },
          user: { columns: { id: true, name: true, email: true } },
        },
      }),
      db.select({ count: count() }).from(reviews).where(where),
    ]);

    const totalCount = countResult[0]?.count ?? 0;

    return successResponse({
      reviews: reviewRows, totalCount,
      pagination: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) },
    });
  } catch (error) {
    logger.error("Admin get reviews error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
