import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq, and, asc, count, inArray } from "drizzle-orm";
import { toHttps } from "@/lib/utils";

export const categoryService = {
  async getCategories(options: { nav?: boolean; active?: boolean } = {}) {
    const { nav, active = true } = options;

    const conditions: any[] = [];
    if (active) conditions.push(eq(categories.isActive, true));
    if (nav) conditions.push(eq(categories.showInNav, true));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db.query.categories.findMany({
      where,
      orderBy: [asc(categories.position)],
      with: {
        children: {
          where: active ? eq(categories.isActive, true) : undefined,
          orderBy: [asc(categories.position)],
        },
      },
    });

    // Get product counts for categories and children
    const allCategoryIds = result.flatMap((c) => [c.id, ...c.children.map((ch) => ch.id)]);
    const productCounts: Record<string, number> = {};
    if (allCategoryIds.length > 0) {
      const countRows = await db
        .select({ categoryId: products.categoryId, count: count() })
        .from(products)
        .where(inArray(products.categoryId, allCategoryIds))
        .groupBy(products.categoryId);
      countRows.forEach((r) => { if (r.categoryId) productCounts[r.categoryId] = r.count; });
    }

    return {
      categories: result.map((c) => ({
        ...c,
        image: c.image ? toHttps(c.image) : null,
        _count: { products: productCounts[c.id] || 0 },
        children: c.children.map((child) => ({
          ...child,
          image: child.image ? toHttps(child.image) : null,
          _count: { products: productCounts[child.id] || 0 },
        })),
      })),
    };
  },

  async getCategoryBySlug(slug: string) {
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
      with: {
        parent: { columns: { id: true, name: true, slug: true } },
        children: {
          where: eq(categories.isActive, true),
          orderBy: [asc(categories.position)],
        },
      },
    });

    if (!category) return { category: null };

    // Get product counts for children
    const childIds = category.children.map((c) => c.id);
    const productCounts: Record<string, number> = {};
    if (childIds.length > 0) {
      const countRows = await db
        .select({ categoryId: products.categoryId, count: count() })
        .from(products)
        .where(inArray(products.categoryId, childIds))
        .groupBy(products.categoryId);
      countRows.forEach((r) => { if (r.categoryId) productCounts[r.categoryId] = r.count; });
    }

    return {
      category: {
        ...category,
        children: category.children.map((child) => ({
          ...child,
          _count: { products: productCounts[child.id] || 0 },
        })),
      },
    };
  },

  async getCategoryTree() {
    const result = await db.query.categories.findMany({
      orderBy: [asc(categories.position)],
      with: {
        parent: { columns: { id: true, name: true } },
        children: true,
      },
    });

    // Get product counts
    const allIds = result.map((c) => c.id);
    const productCounts: Record<string, number> = {};
    if (allIds.length > 0) {
      const countRows = await db
        .select({ categoryId: products.categoryId, count: count() })
        .from(products)
        .where(inArray(products.categoryId, allIds))
        .groupBy(products.categoryId);
      countRows.forEach((r) => { if (r.categoryId) productCounts[r.categoryId] = r.count; });
    }

    return {
      categories: result.map((c) => ({
        ...c,
        _count: {
          products: productCounts[c.id] || 0,
          children: c.children.length,
        },
      })),
    };
  },
};
