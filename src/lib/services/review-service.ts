import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq, and, desc, count, avg, sql } from "drizzle-orm";
import { toHttps } from "@/lib/utils";

export const reviewService = {
  async getProductReviews(
    productId: string,
    options: { page?: number; limit?: number } = {}
  ) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const whereApproved = and(eq(reviews.productId, productId), eq(reviews.isApproved, true));

    const [reviewRows, countResult, statsResult] = await Promise.all([
      db.query.reviews.findMany({
        where: whereApproved,
        orderBy: [desc(reviews.createdAt)],
        limit,
        offset,
        columns: {
          id: true,
          productId: true,
          userId: true,
          userName: true,
          title: true,
          rating: true,
          comment: true,
          media: true,
          adminReply: true,
          isFeatured: true,
          isApproved: true,
          createdAt: true,
        },
      }),
      db.select({ count: count() }).from(reviews).where(whereApproved),
      db.select({ avgRating: avg(reviews.rating), count: count() }).from(reviews).where(whereApproved),
    ]);

    const totalCount = countResult[0]?.count ?? 0;
    const stats = statsResult[0];

    // Rating distribution
    const ratingDistRows = await db
      .select({ rating: reviews.rating, count: count() })
      .from(reviews)
      .where(whereApproved)
      .groupBy(reviews.rating);

    const distribution: Record<string, number> = {};
    ratingDistRows.forEach((r) => {
      distribution[String(r.rating)] = r.count;
    });

    return {
      reviews: reviewRows.map((r) => ({
        ...r,
        media: (r.media || []).map(toHttps),
        createdAt: r.createdAt.toISOString(),
      })),
      stats: {
        averageRating: Math.round((Number(stats?.avgRating) || 0) * 10) / 10,
        totalReviews: stats?.count || 0,
        ratingDistribution: distribution,
      },
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  },

  async createReview(data: {
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    title?: string;
    comment?: string;
  }) {
    // Validate rating
    if (data.rating < 1 || data.rating > 5 || !Number.isInteger(data.rating)) {
      throw new Error("Rating must be an integer between 1 and 5");
    }

    // Check for duplicate review
    const existing = await db.query.reviews.findFirst({
      where: and(eq(reviews.productId, data.productId), eq(reviews.userId, data.userId)),
    });
    if (existing) {
      throw new Error("You have already reviewed this product");
    }

    const [review] = await db.insert(reviews).values({
      productId: data.productId,
      userId: data.userId,
      userName: data.userName,
      rating: data.rating,
      title: data.title || null,
      comment: data.comment || null,
      media: [],
    }).returning();

    return { review };
  },
};
