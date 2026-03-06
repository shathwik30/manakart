import { db } from "@/db";
import { orders, users, products, categories, brands, orderItems } from "@/db/schema";
import { eq, and, gte, lt, sum, count, desc, asc, sql, isNull, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const paidWhere = eq(orders.paymentStatus, "PAID");

    const [
      [totalOrdersR], [totalRevenueR],
      [todayOrdersR], [todayRevenueR],
      [monthOrdersR], [monthRevenueR],
      [lastMonthRevenueR],
      [totalUsersR], [totalProductsR], [totalCategoriesR], [totalBrandsR],
      ordersByStatus,
      topSellingProducts,
      lowStockProducts,
      recentOrders,
      ordersLast30Days,
    ] = await Promise.all([
      db.select({ count: count() }).from(orders).where(paidWhere),
      db.select({ sum: sum(orders.total) }).from(orders).where(paidWhere),
      db.select({ count: count() }).from(orders).where(and(paidWhere, gte(orders.createdAt, startOfToday))),
      db.select({ sum: sum(orders.total) }).from(orders).where(and(paidWhere, gte(orders.createdAt, startOfToday))),
      db.select({ count: count() }).from(orders).where(and(paidWhere, gte(orders.createdAt, startOfMonth))),
      db.select({ sum: sum(orders.total) }).from(orders).where(and(paidWhere, gte(orders.createdAt, startOfMonth))),
      db.select({ sum: sum(orders.total) }).from(orders).where(and(paidWhere, gte(orders.createdAt, startOfLastMonth), lt(orders.createdAt, startOfMonth))),
      db.select({ count: count() }).from(users).where(eq(users.role, "USER")),
      db.select({ count: count() }).from(products).where(isNull(products.deletedAt)),
      db.select({ count: count() }).from(categories),
      db.select({ count: count() }).from(brands),
      db.select({ status: orders.orderStatus, count: count() }).from(orders).groupBy(orders.orderStatus),
      db.select({ productId: orderItems.productId, totalSold: sum(orderItems.quantity) })
        .from(orderItems).groupBy(orderItems.productId)
        .orderBy(desc(sum(orderItems.quantity))).limit(5),
      db.query.products.findMany({
        where: and(eq(products.isActive, true), isNull(products.deletedAt), sql`${products.stock} < 10`),
        columns: { id: true, title: true, stock: true },
        limit: 5, orderBy: [asc(products.stock)],
      }),
      db.query.orders.findMany({
        limit: 5, orderBy: [desc(orders.createdAt)],
        columns: { id: true, orderNumber: true, total: true, orderStatus: true, createdAt: true },
        with: { user: { columns: { name: true } } },
      }),
      db.query.orders.findMany({
        where: and(paidWhere, gte(orders.createdAt, last30Days)),
        columns: { createdAt: true, total: true },
        orderBy: [asc(orders.createdAt)],
      }),
    ]);

    // Fetch top selling product details
    const topProductIds = topSellingProducts.map((p) => p.productId);
    let topProducts: any[] = [];
    if (topProductIds.length > 0) {
      topProducts = await db.query.products.findMany({
        where: inArray(products.id, topProductIds),
        columns: { id: true, title: true, images: true },
      });
    }

    const topSellingWithDetails = topSellingProducts.map((item) => {
      const product = topProducts.find((p: any) => p.id === item.productId);
      return {
        productId: item.productId, title: product?.title || "Unknown",
        image: product?.images?.[0] || null, totalSold: Number(item.totalSold) || 0,
      };
    });

    const lowStock = lowStockProducts.map((p) => ({
      id: p.id, title: p.title, totalStock: p.stock,
    }));

    const lastMonthRev = Number(lastMonthRevenueR?.sum) || 0;
    const thisMonthRev = Number(monthRevenueR?.sum) || 0;
    const growth = lastMonthRev > 0 ? Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100) : 100;

    const dailyData: Record<string, { orders: number; revenue: number }> = {};
    ordersLast30Days.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      if (!dailyData[dateKey]) dailyData[dateKey] = { orders: 0, revenue: 0 };
      dailyData[dateKey].orders += 1;
      dailyData[dateKey].revenue += order.total;
    });

    const chartData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split("T")[0];
      const dayData = dailyData[dateKey] || { orders: 0, revenue: 0 };
      chartData.push({
        date: dateKey, dateLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        orders: dayData.orders, revenue: dayData.revenue,
      });
    }

    return successResponse({
      overview: {
        totalOrders: totalOrdersR?.count ?? 0, totalRevenue: Number(totalRevenueR?.sum) || 0,
        totalUsers: totalUsersR?.count ?? 0, totalProducts: totalProductsR?.count ?? 0,
        totalCategories: totalCategoriesR?.count ?? 0, totalBrands: totalBrandsR?.count ?? 0,
      },
      today: { orders: todayOrdersR?.count ?? 0, revenue: Number(todayRevenueR?.sum) || 0 },
      thisMonth: { orders: monthOrdersR?.count ?? 0, revenue: thisMonthRev, growth },
      ordersByStatus: ordersByStatus.map((item) => ({ status: item.status, count: item.count })),
      topSellingProducts: topSellingWithDetails,
      lowStockProducts: lowStock,
      recentOrders,
      chartData,
    });
  } catch (error) {
    logger.error("Admin analytics error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
