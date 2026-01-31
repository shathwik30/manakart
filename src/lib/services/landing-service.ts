
import prisma from "@/lib/prisma";

export const landingService = {
  async getHeroContent() {
    const heroContent = await prisma.heroContent.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
      select: {
        id: true,
        title: true,
        subtitle: true,
        image: true,
        ctaText: true,
        ctaLink: true,
        position: true,
        isActive: true, // Required by HeroContent interface
        createdAt: true, // Required by HeroContent interface
      },
    });
    return { heroContent };
  },

  async getReviews(options: { featured?: boolean; limit?: number } = {}) {
    const { featured = false, limit = 10 } = options;
    
    const dbReviews = await prisma.review.findMany({
      where: {
        isApproved: true,
        ...(featured && { isFeatured: true }),
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userName: true,
        rating: true,
        comment: true,
        media: true,
        createdAt: true,
      },
    });

    // Transform to match Review interface
    const reviews = dbReviews.map(r => ({
      ...r,
      comment: r.comment || undefined, // Convert null to undefined
      createdAt: r.createdAt.toISOString(), // Convert Date to string
    }));

    const allReviews = await prisma.review.findMany({
      where: { isApproved: true },
      select: { rating: true },
    });

    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / allReviews.length
        : 0;

    return {
      reviews,
      stats: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: allReviews.length,
      },
    };
  },

  async getReels(limit: number = 20) {
    const reels = await prisma.reel.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
      take: limit,
      select: {
        id: true,
        videoUrl: true,
        thumbnail: true,
        title: true,
        outfitId: true,
        isActive: true, // Required
        position: true, // Required
        createdAt: true, // Required
      },
    });

    const outfitIds = reels
      .filter((reel) => reel.outfitId)
      .map((reel) => reel.outfitId as string);

    const outfits =
      outfitIds.length > 0
        ? await prisma.outfit.findMany({
            where: { id: { in: outfitIds } },
            select: {
              id: true,
              title: true,
              slug: true,
              bundlePrice: true,
            },
          })
        : [];

    const outfitMap = new Map(outfits.map((o) => [o.id, o]));

    const reelsWithOutfits = reels.map((reel) => ({
      ...reel,
      outfit: reel.outfitId ? outfitMap.get(reel.outfitId) || undefined : undefined,
    }));

    return { reels: reelsWithOutfits };
  },
};
