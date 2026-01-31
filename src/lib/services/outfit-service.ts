
import prisma from "@/lib/prisma";

export const outfitService = {
  async getOutfits(params: { type?: string; featured?: boolean } = {}) {
    const { type, featured } = params;
    const where: any = { isActive: true };

    if (type) {
      where.genderType = type.toUpperCase();
    }

    if (featured !== undefined) {
      where.isFeatured = featured;
    }

    const outfits = await prisma.outfit.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                basePrice: true,
                images: true,
                availableSizes: true,
                stockPerSize: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    const transformedOutfits = outfits.map((outfit) => {
      const products = outfit.items.map((item) => ({
        ...item.product,
        description: item.product.description || undefined,
        sizeChart: (item.product.sizeChart as Record<string, Record<string, number>>) || undefined,
        stockPerSize: item.product.stockPerSize as Record<string, number>,
      }));
      return {
        id: outfit.id,
        title: outfit.title,
        slug: outfit.slug,
        genderType: outfit.genderType,
        description: outfit.description || undefined,
        heroImages: outfit.heroImages,
        bundlePrice: outfit.bundlePrice,
        isFeatured: outfit.isFeatured,
        isActive: outfit.isActive,
        productCount: products.length,
        products,
      };
    });

    return { outfits: transformedOutfits };
  },

  async getOutfitBySlug(slug: string) {
    const outfit = await prisma.outfit.findUnique({
      where: { slug },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                description: true,
                basePrice: true,
                images: true,
                availableSizes: true,
                stockPerSize: true,
                isActive: true,
                sizeChart: true,
              },
            },
          },
        },
      },
    });

    if (!outfit) {
      return { outfit: null };
    }

    const products = outfit.items.map((item) => item.product);
    const individualTotal = products.reduce((sum, p) => sum + p.basePrice, 0);
    const savings = individualTotal - outfit.bundlePrice;

    const transformedOutfit = {
      id: outfit.id,
      title: outfit.title,
      slug: outfit.slug,
      genderType: outfit.genderType,
      description: outfit.description || undefined,
      heroImages: outfit.heroImages,
      bundlePrice: outfit.bundlePrice,
      isFeatured: outfit.isFeatured,
      isActive: outfit.isActive,
      productCount: products.length,
      products: products.map(p => ({
        ...p,
        description: p.description || undefined,
        sizeChart: (p.sizeChart as Record<string, Record<string, number>>) || undefined,
        stockPerSize: p.stockPerSize as Record<string, number>,
      })),
      individualTotal,
      savings,
      createdAt: outfit.createdAt.toISOString(),
    };

    return { outfit: transformedOutfit };
  },
};
