import { db } from "@/db";
import { deals, products, categories, brands } from "@/db/schema";
import { eq, and, lte, gt, asc } from "drizzle-orm";
import { toHttps } from "@/lib/utils";

export const dealService = {
  async getActiveDeals() {
    const now = new Date();

    const result = await db.query.deals.findMany({
      where: and(
        eq(deals.isActive, true),
        lte(deals.startsAt, now),
        gt(deals.endsAt, now)
      ),
      orderBy: [asc(deals.position)],
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
};
