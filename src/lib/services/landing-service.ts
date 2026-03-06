import { db } from "@/db";
import { heroContents, reviews, deals, homepageSections } from "@/db/schema";
import { eq, and, lte, gt, desc, asc } from "drizzle-orm";
import { toHttps } from "@/lib/utils";

export const landingService = {
  async getHeroContent() {
    const result = await db.query.heroContents.findMany({
      where: eq(heroContents.isActive, true),
      orderBy: [asc(heroContents.position)],
      columns: {
        id: true,
        title: true,
        subtitle: true,
        image: true,
        ctaText: true,
        ctaLink: true,
        position: true,
        isActive: true,
        createdAt: true,
      },
    });
    return {
      heroContent: result.map((h) => ({ ...h, image: toHttps(h.image) })),
    };
  },

  async getReviews(options: { featured?: boolean; limit?: number } = {}) {
    const { featured = false, limit = 10 } = options;

    const conditions: any[] = [eq(reviews.isApproved, true)];
    if (featured) conditions.push(eq(reviews.isFeatured, true));

    const dbReviews = await db.query.reviews.findMany({
      where: and(...conditions),
      limit,
      orderBy: [desc(reviews.createdAt)],
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
    });

    const reviewsMapped = dbReviews.map((r) => ({
      ...r,
      comment: r.comment || undefined,
      media: (r.media || []).map(toHttps),
      createdAt: r.createdAt.toISOString(),
    }));

    const allReviews = await db.query.reviews.findMany({
      where: eq(reviews.isApproved, true),
      columns: { rating: true },
    });

    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    return {
      reviews: reviewsMapped,
      stats: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: allReviews.length,
      },
    };
  },

  async getActiveDeals() {
    const now = new Date();
    const result = await db.query.deals.findMany({
      where: and(
        eq(deals.isActive, true),
        lte(deals.startsAt, now),
        gt(deals.endsAt, now)
      ),
      orderBy: [asc(deals.position)],
      limit: 10,
      with: {
        product: {
          with: {
            category: { columns: { id: true, name: true, slug: true } },
            brand: { columns: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    return {
      deals: result.map((d) => ({
        ...d,
        product: {
          ...d.product,
          images: (d.product.images || []).map(toHttps),
        },
      })),
    };
  },

  async getHomepageSections() {
    const sections = await db.query.homepageSections.findMany({
      where: eq(homepageSections.isActive, true),
      orderBy: [asc(homepageSections.position)],
    });

    return { sections };
  },
};
