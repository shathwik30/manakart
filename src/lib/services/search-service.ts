import { db } from "@/db";
import { products, categories, brands } from "@/db/schema";
import { eq, and, or, desc, asc, ilike, gte, lte, isNull, count, inArray } from "drizzle-orm";
import { toHttps } from "@/lib/utils";

export interface SearchOptions {
  q: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export const searchService = {
  async search(options: SearchOptions) {
    const { q, categoryId, brandId, minPrice, maxPrice, sort, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const conditions: any[] = [
      eq(products.isActive, true),
      isNull(products.deletedAt),
      or(
        ilike(products.title, `%${q}%`),
        ilike(products.description, `%${q}%`),
        ilike(products.sku, `%${q}%`)
      ),
    ];

    if (categoryId) {
      // Check if this is a parent category with children
      const childCategories = await db.query.categories.findMany({
        where: eq(categories.parentId, categoryId),
        columns: { id: true },
      });
      if (childCategories.length > 0) {
        const allIds = [categoryId, ...childCategories.map((c) => c.id)];
        conditions.push(inArray(products.categoryId, allIds));
      } else {
        conditions.push(eq(products.categoryId, categoryId));
      }
    }
    if (brandId) conditions.push(eq(products.brandId, brandId));
    if (minPrice !== undefined) conditions.push(gte(products.basePrice, minPrice));
    if (maxPrice !== undefined) conditions.push(lte(products.basePrice, maxPrice));

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

    return {
      products: productRows.map((p) => ({
        ...p,
        images: (p.images || []).map(toHttps),
        category: p.categoryId ? { id: p.categoryId, name: p.categoryName, slug: p.categorySlug } : null,
        brand: p.brandId ? { id: p.brandId, name: p.brandName, slug: p.brandSlug } : null,
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
};
