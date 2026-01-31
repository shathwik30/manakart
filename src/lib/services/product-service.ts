
import prisma from '@/lib/prisma';

export interface GetProductsOptions {
  category?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const productService = {
  async getProducts(options: GetProductsOptions = {}) {
    const { category, isActive = true, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: {
      isActive?: boolean;
      category?: string;
    } = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (category) {
      where.category = category;
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
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
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + products.length < totalCount,
      },
    };
  },
};
