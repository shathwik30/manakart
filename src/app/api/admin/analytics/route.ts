import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    
    const [
      totalOrders,
      totalRevenue,
      todayOrders,
      todayRevenue,
      monthOrders,
      monthRevenue,
      lastMonthRevenue,
      totalUsers,
      totalProducts,
      totalOutfits,
      ordersByStatus,
      topSellingProducts,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      
      prisma.order.count({
        where: { paymentStatus: 'PAID' },
      }),

      
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { total: true },
      }),

      
      prisma.order.count({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startOfToday },
        },
      }),

      
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startOfToday },
        },
        _sum: { total: true },
      }),

      
      prisma.order.count({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startOfMonth },
        },
      }),

      
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),

      
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: {
            gte: startOfLastMonth,
            lt: startOfMonth,
          },
        },
        _sum: { total: true },
      }),

      
      prisma.user.count({
        where: { role: 'USER' },
      }),

      
      prisma.product.count(),

      
      prisma.outfit.count(),

      
      prisma.order.groupBy({
        by: ['orderStatus'],
        _count: true,
      }),

      
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),

      
      prisma.product.findMany({
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          stockPerSize: true,
        },
      }),

      
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          orderStatus: true,
          createdAt: true,
          user: {
            select: { name: true },
          },
        },
      }),
    ])

    
    const topProductIds = topSellingProducts.map((p: { productId: string }) => p.productId)
    const topProducts = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, title: true, images: true },
    })

    const topSellingWithDetails = topSellingProducts.map((item: { productId: string; _sum: { quantity: number | null } }) => {
      const product = topProducts.find((p: { id: string }) => p.id === item.productId)
      return {
        productId: item.productId,
        title: product?.title || 'Unknown',
        image: product?.images[0] || null,
        totalSold: item._sum.quantity || 0,
      }
    })

    
    const lowStock = lowStockProducts
      .map((product: { id: string; title: string; stockPerSize: any }) => {
        const stock = product.stockPerSize as Record<string, number>
        const totalStock = Object.values(stock).reduce((sum: number, qty: number) => sum + qty, 0)
        return {
          id: product.id,
          title: product.title,
          totalStock,
        }
      })
      .filter((p: { totalStock: number }) => p.totalStock < 10)
      .slice(0, 5)

    
    const lastMonthRev = lastMonthRevenue._sum.total || 0
    const thisMonthRev = monthRevenue._sum.total || 0
    const growth =
      lastMonthRev > 0
        ? Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100)
        : 100

    return successResponse({
      overview: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalUsers,
        totalProducts,
        totalOutfits,
      },
      today: {
        orders: todayOrders,
        revenue: todayRevenue._sum.total || 0,
      },
      thisMonth: {
        orders: monthOrders,
        revenue: thisMonthRev,
        growth,
      },
      ordersByStatus: ordersByStatus.map((item: { orderStatus: string; _count: number }) => ({
        status: item.orderStatus,
        count: item._count,
      })),
      topSellingProducts: topSellingWithDetails,
      lowStockProducts: lowStock,
      recentOrders,
    })
  } catch (error) {
    logger.error('Admin analytics error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}