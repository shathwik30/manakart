import { db } from "@/db";
import { brands, products } from "@/db/schema";
import { eq, asc, count, inArray } from "drizzle-orm";
import { toHttps } from "@/lib/utils";

export const brandService = {
  async getBrands(options: { active?: boolean } = {}) {
    const { active = true } = options;

    const where = active ? eq(brands.isActive, true) : undefined;

    const result = await db.query.brands.findMany({
      where,
      orderBy: [asc(brands.name)],
    });

    // Get product counts
    const brandIds = result.map((b) => b.id);
    const productCounts: Record<string, number> = {};
    if (brandIds.length > 0) {
      const countRows = await db
        .select({ brandId: products.brandId, count: count() })
        .from(products)
        .where(inArray(products.brandId, brandIds))
        .groupBy(products.brandId);
      countRows.forEach((r) => { if (r.brandId) productCounts[r.brandId] = r.count; });
    }

    return {
      brands: result.map((b) => ({
        ...b,
        logo: b.logo ? toHttps(b.logo) : null,
        _count: { products: productCounts[b.id] || 0 },
      })),
    };
  },
};
