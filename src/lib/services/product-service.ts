import { db } from "@/db";
import { products, categories, brands, reviews } from "@/db/schema";
import { eq, and, or, desc, asc, ilike, gte, lte, isNull, count, avg, inArray } from "drizzle-orm";
import { toHttps } from "@/lib/utils";

export interface GetProductsOptions {
  categoryId?: string;
  categoryIds?: string[];
  brandId?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}

export const productService = {
  async getProducts(options: GetProductsOptions = {}) {
    const {
      categoryId,
      categoryIds,
      brandId,
      search,
      sort,
      minPrice,
      maxPrice,
      isActive = true,
      isFeatured,
      page = 1,
      limit = 20,
    } = options;
    const offset = (page - 1) * limit;

    const conditions: any[] = [isNull(products.deletedAt)];

    if (isActive !== undefined) conditions.push(eq(products.isActive, isActive));
    if (categoryIds && categoryIds.length > 0) {
      conditions.push(inArray(products.categoryId, categoryIds));
    } else if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }
    if (brandId) conditions.push(eq(products.brandId, brandId));
    if (isFeatured !== undefined) conditions.push(eq(products.isFeatured, isFeatured));
    if (minPrice !== undefined) conditions.push(gte(products.basePrice, minPrice));
    if (maxPrice !== undefined) conditions.push(lte(products.basePrice, maxPrice));

    if (search) {
      conditions.push(
        or(
          ilike(products.title, `%${search}%`),
          ilike(products.description, `%${search}%`),
          ilike(products.sku, `%${search}%`)
        )
      );
    }

    const where = and(...conditions);

    let orderByClause: any = desc(products.createdAt);
    if (sort === "price_asc") orderByClause = asc(products.basePrice);
    else if (sort === "price_desc") orderByClause = desc(products.basePrice);
    else if (sort === "newest") orderByClause = desc(products.createdAt);
    else if (sort === "name_asc") orderByClause = asc(products.title);

    const [productRows, countResult] = await Promise.all([
      db
        .select({
          id: products.id,
          title: products.title,
          slug: products.slug,
          description: products.description,
          basePrice: products.basePrice,
          comparePrice: products.comparePrice,
          images: products.images,
          stock: products.stock,
          sku: products.sku,
          specifications: products.specifications,
          isFeatured: products.isFeatured,
          isActive: products.isActive,
          deletedAt: products.deletedAt,
          categoryId: products.categoryId,
          brandId: products.brandId,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          categoryName: categories.name,
          categorySlug: categories.slug,
          brandName: brands.name,
          brandSlug: brands.slug,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(brands, eq(products.brandId, brands.id))
        .where(where)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(products).where(where),
    ]);

    const totalCount = countResult[0]?.count ?? 0;

    // Get review counts for these products
    const productIds = productRows.map((p) => p.id);
    const reviewCounts: Record<string, number> = {};
    if (productIds.length > 0) {
      const reviewCountRows = await db
        .select({ productId: reviews.productId, count: count() })
        .from(reviews)
        .where(and(eq(reviews.isApproved, true), inArray(reviews.productId, productIds)))
        .groupBy(reviews.productId);
      reviewCountRows.forEach((r) => { reviewCounts[r.productId] = r.count; });
    }

    return {
      products: productRows.map((p) => ({
        ...p,
        images: (p.images || []).map(toHttps),
        description: p.description || undefined,
        specifications: p.specifications as any[] || undefined,
        category: p.categoryId ? { id: p.categoryId, name: p.categoryName, slug: p.categorySlug } : null,
        brand: p.brandId ? { id: p.brandId, name: p.brandName, slug: p.brandSlug } : null,
        _count: { reviews: reviewCounts[p.id] || 0 },
        // clean up joined fields
        categoryName: undefined,
        categorySlug: undefined,
        brandName: undefined,
        brandSlug: undefined,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  },

  async getProductBySlug(slug: string) {
    const result = await db.query.products.findFirst({
      where: and(eq(products.slug, slug), isNull(products.deletedAt)),
      with: {
        category: {
          columns: { id: true, name: true, slug: true },
          with: {
            parent: { columns: { id: true, name: true, slug: true } },
          },
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
      },
    });

    if (!result) {
      return { product: null };
    }

    const reviewStats = await db
      .select({ avgRating: avg(reviews.rating), count: count() })
      .from(reviews)
      .where(and(eq(reviews.productId, result.id), eq(reviews.isApproved, true)));

    const stats = reviewStats[0];

    const productData: any = {
      ...result,
      images: (result.images || []).map(toHttps),
      description: result.description || undefined,
      specifications: result.specifications as any[] || undefined,
      reviewStats: {
        averageRating: Math.round((Number(stats?.avgRating) || 0) * 10) / 10,
        totalReviews: stats?.count || 0,
      },
    };

    // Include variant data only when product has variants
    if (result.hasVariants && (result as any).options) {
      productData.options = (result as any).options;
      productData.variants = (result as any).variants;
    }

    return { product: productData };
  },
};
