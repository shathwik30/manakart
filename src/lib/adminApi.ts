import api, { Product, User, Order, Coupon, Outfit, OutfitDetail, HeroContent, Reel, Review, ReviewStats, Pagination } from "./api";




export const adminAnalyticsApi = {
  getStats: () =>
    api<{
      overview: {
        totalRevenue: number;
        totalOrders: number;
        totalProducts: number;
        totalUsers: number;
        totalOutfits: number;
      };
      today: { orders: number; revenue: number };
      thisMonth: { orders: number; revenue: number; growth: number };
      ordersByStatus: { status: string; count: number }[];
      topSellingProducts: any[];
      lowStockProducts: any[];
      recentOrders: any[];
      chartData: {
        date: string;
        dateLabel: string;
        orders: number;
        revenue: number;
      }[];
    }>("/api/admin/analytics"),
};




export const adminAuthApi = {
  login: (data: { email: string; secretKey: string }) =>
    api<{ success: boolean; message: string }>("/api/admin/auth", {
      method: "POST",
      body: data,
    }),
};




export const adminProductsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    return api<{ products: Product[]; totalCount: number }>(
      `/api/admin/products${query ? `?${query}` : ""}`
    );
  },

  getById: (id: string) =>
    api<{ product: Product }>(`/api/admin/products/${id}`),

  create: (data: any) =>
    api<{ product: Product; message: string }>("/api/admin/products", {
      method: "POST",
      body: data,
    }),

  update: (id: string, data: any) =>
    api<{ product: Product; message: string }>(`/api/admin/products/${id}`, {
      method: "PATCH",
      body: data,
    }),

  delete: (id: string) =>
    api<{ message: string }>(`/api/admin/products/${id}`, {
      method: "DELETE",
    }),
};




export const adminOrdersApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.status) searchParams.set("status", params.status);

    const query = searchParams.toString();
    return api<{ orders: Order[]; totalCount: number }>(
      `/api/admin/orders${query ? `?${query}` : ""}`
    );
  },

  getById: (id: string) =>
    api<{ order: Order }>(`/api/admin/orders/${id}`),

  updateStatus: (id: string, status: string) =>
    api<{ order: Order; message: string }>(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      body: { status },
    }),
};




export const adminUsersApi = {
  
  getAll: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const query = searchParams.toString();
    return api<{ users: User[]; totalCount: number }>(
      `/api/admin/users${query ? `?${query}` : ""}`
    );
  },
};




export const adminCouponsApi = {
  getAll: () =>
    api<{ coupons: Coupon[] }>("/api/admin/coupons"),

  create: (data: Partial<Coupon>) =>
    api<{ coupon: Coupon; message: string }>("/api/admin/coupons", {
      method: "POST",
      body: data,
    }),

  update: (id: string, data: Partial<Coupon>) =>
    api<{ coupon: Coupon; message: string }>(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      body: data,
    }),

  delete: (id: string) =>
    api<{ message: string }>(`/api/admin/coupons/${id}`, {
      method: "DELETE",
    }),
};




export const adminOutfitsApi = {
  getAll: (params?: { page?: number; limit?: number; type?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.type) searchParams.set("type", params.type);

    const query = searchParams.toString();
    return api<{ outfits: Outfit[]; totalCount: number }>(
      `/api/admin/outfits${query ? `?${query}` : ""}`
    );
  },

  getById: (id: string) =>
    api<OutfitDetail>(`/api/admin/outfits/${id}`),

  create: (data: Partial<Outfit>) =>
    api<{ outfit: Outfit; message: string }>("/api/admin/outfits", {
      method: "POST",
      body: data,
    }),

  delete: (id: string) =>
    api<{ message: string }>(`/api/admin/outfits/${id}`, {
      method: "DELETE",
    }),
};




export const adminHeroApi = {
  getAll: () =>
    api<{ heroContent: HeroContent[] }>("/api/admin/hero"),

  getById: (id: string) =>
    api<{ heroContent: HeroContent }>(`/api/admin/hero/${id}`),

  create: (data: Partial<HeroContent>) =>
    api<{ heroContent: HeroContent; message: string }>("/api/admin/hero", {
      method: "POST",
      body: data,
    }),

  update: (id: string, data: Partial<HeroContent>) =>
    api<{ heroContent: HeroContent; message: string }>(`/api/admin/hero/${id}`, {
      method: "PATCH",
      body: data,
    }),

  delete: (id: string) =>
    api<{ message: string }>(`/api/admin/hero/${id}`, {
      method: "DELETE",
    }),
};




export const adminReelsApi = {
  getAll: () =>
    api<{ reels: Reel[] }>("/api/admin/reels"),

  create: (data: Partial<Reel>) =>
    api<{ reel: Reel; message: string }>("/api/admin/reels", {
      method: "POST",
      body: data,
    }),

  update: (id: string, data: Partial<Reel>) =>
    api<{ reel: Reel; message: string }>(`/api/admin/reels/${id}`, {
      method: "PATCH",
      body: data,
    }),

  delete: (id: string) =>
    api<{ message: string }>(`/api/admin/reels/${id}`, {
      method: "DELETE",
    }),
};




export const adminReviewsApi = {
  getAll: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const query = searchParams.toString();
    return api<{ reviews: Review[]; totalCount: number }>(
      `/api/admin/reviews${query ? `?${query}` : ""}`
    );
  },

  delete: (id: string) =>
    api<{ message: string }>(`/api/admin/reviews/${id}`, {
      method: "DELETE",
    }),
};


export const adminApi = {
  ...adminAnalyticsApi,
  getProducts: adminProductsApi.getAll,
  getProduct: adminProductsApi.getById,
  createProduct: adminProductsApi.create,
  updateProduct: adminProductsApi.update,
  deleteProduct: adminProductsApi.delete,
  getOrders: adminOrdersApi.getAll,
  getOrder: adminOrdersApi.getById,
  updateOrderStatus: adminOrdersApi.updateStatus,
  getUsers: adminUsersApi.getAll,
  getCoupons: adminCouponsApi.getAll,
  createCoupon: adminCouponsApi.create,
  updateCoupon: adminCouponsApi.update,
  deleteCoupon: adminCouponsApi.delete,
  getOutfits: adminOutfitsApi.getAll,
  getOutfitById: adminOutfitsApi.getById,
  createOutfit: adminOutfitsApi.create,
  deleteOutfit: adminOutfitsApi.delete,
  getHeroContent: adminHeroApi.getAll,
  getHeroById: adminHeroApi.getById,
  createHeroContent: adminHeroApi.create,
  updateHeroContent: adminHeroApi.update,
  deleteHeroContent: adminHeroApi.delete,
  getReels: adminReelsApi.getAll,
  createReel: adminReelsApi.create,
  updateReel: adminReelsApi.update,
  deleteReel: adminReelsApi.delete,
  getReviews: adminReviewsApi.getAll,
  deleteReview: adminReviewsApi.delete,
};
