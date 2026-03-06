import api, { Product, User, Order, Coupon, HeroContent, Review, Category, Brand, Deal, HomepageSection } from "./api";

export const adminAnalyticsApi = {
  getStats: () =>
    api<{
      overview: {
        totalRevenue: number;
        totalOrders: number;
        totalProducts: number;
        totalUsers: number;
        totalCategories: number;
        totalBrands: number;
      };
      today: { orders: number; revenue: number };
      thisMonth: { orders: number; revenue: number; growth: number };
      ordersByStatus: { status: string; count: number }[];
      topSellingProducts: any[];
      lowStockProducts: any[];
      recentOrders: any[];
      chartData: { date: string; dateLabel: string; orders: number; revenue: number }[];
    }>("/api/admin/analytics"),
};

export const adminAuthApi = {
  login: (data: { email: string; secretKey: string }) =>
    api<{ success: boolean; message: string }>("/api/admin/auth", { method: "POST", body: data }),
};

export const adminProductsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; categoryId?: string; brandId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.categoryId) searchParams.set("categoryId", params.categoryId);
    if (params?.brandId) searchParams.set("brandId", params.brandId);
    const query = searchParams.toString();
    return api<{ products: Product[]; totalCount: number }>(`/api/admin/products${query ? `?${query}` : ""}`);
  },
  getById: (id: string) => api<{ product: Product }>(`/api/admin/products/${id}`),
  create: (data: any) => api<{ product: Product; message: string }>("/api/admin/products", { method: "POST", body: data }),
  update: (id: string, data: any) => api<{ product: Product; message: string }>(`/api/admin/products/${id}`, { method: "PATCH", body: data }),
  delete: (id: string) => api<{ message: string }>(`/api/admin/products/${id}`, { method: "DELETE" }),
};

export const adminOrdersApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.status) searchParams.set("status", params.status);
    const query = searchParams.toString();
    return api<{ orders: Order[]; totalCount: number }>(`/api/admin/orders${query ? `?${query}` : ""}`);
  },
  getById: (id: string) => api<{ order: Order }>(`/api/admin/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    api<{ order: Order; message: string }>(`/api/admin/orders/${id}`, { method: "PATCH", body: { orderStatus: status } }),
};

export const adminUsersApi = {
  getAll: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const query = searchParams.toString();
    return api<{ users: User[]; totalCount: number }>(`/api/admin/users${query ? `?${query}` : ""}`);
  },
};

export const adminCouponsApi = {
  getAll: () => api<{ coupons: Coupon[] }>("/api/admin/coupons"),
  create: (data: Partial<Coupon>) => api<{ coupon: Coupon; message: string }>("/api/admin/coupons", { method: "POST", body: data }),
  update: (id: string, data: Partial<Coupon>) => api<{ coupon: Coupon; message: string }>(`/api/admin/coupons/${id}`, { method: "PATCH", body: data }),
  delete: (id: string) => api<{ message: string }>(`/api/admin/coupons/${id}`, { method: "DELETE" }),
};

export const adminCategoriesApi = {
  getAll: () => api<{ categories: Category[] }>("/api/admin/categories"),
  getById: (id: string) => api<{ category: Category }>(`/api/admin/categories/${id}`),
  create: (data: Partial<Category>) => api<{ category: Category; message: string }>("/api/admin/categories", { method: "POST", body: data }),
  update: (id: string, data: Partial<Category>) => api<{ category: Category; message: string }>(`/api/admin/categories/${id}`, { method: "PATCH", body: data }),
  delete: (id: string) => api<{ message: string }>(`/api/admin/categories/${id}`, { method: "DELETE" }),
};

export const adminBrandsApi = {
  getAll: () => api<{ brands: Brand[] }>("/api/admin/brands"),
  create: (data: Partial<Brand>) => api<{ brand: Brand; message: string }>("/api/admin/brands", { method: "POST", body: data }),
  update: (id: string, data: Partial<Brand>) => api<{ brand: Brand; message: string }>(`/api/admin/brands/${id}`, { method: "PATCH", body: data }),
  delete: (id: string) => api<{ message: string }>(`/api/admin/brands/${id}`, { method: "DELETE" }),
};

export const adminDealsApi = {
  getAll: () => api<{ deals: Deal[] }>("/api/admin/deals"),
  getById: (id: string) => api<{ deal: Deal }>(`/api/admin/deals/${id}`),
  create: (data: Partial<Deal>) => api<{ deal: Deal; message: string }>("/api/admin/deals", { method: "POST", body: data }),
  update: (id: string, data: Partial<Deal>) => api<{ deal: Deal; message: string }>(`/api/admin/deals/${id}`, { method: "PATCH", body: data }),
  delete: (id: string) => api<{ message: string }>(`/api/admin/deals/${id}`, { method: "DELETE" }),
};

export const adminHomepageSectionsApi = {
  getAll: () => api<{ sections: HomepageSection[] }>("/api/admin/homepage"),
  create: (data: Partial<HomepageSection>) => api<{ section: HomepageSection; message: string }>("/api/admin/homepage", { method: "POST", body: data }),
  update: (id: string, data: Partial<HomepageSection>) => api<{ section: HomepageSection; message: string }>(`/api/admin/homepage/${id}`, { method: "PATCH", body: data }),
  delete: (id: string) => api<{ message: string }>(`/api/admin/homepage/${id}`, { method: "DELETE" }),
};

export const adminHeroApi = {
  getAll: () => api<{ heroContent: HeroContent[] }>("/api/admin/hero"),
  getById: (id: string) => api<{ heroContent: HeroContent }>(`/api/admin/hero/${id}`),
  create: (data: Partial<HeroContent>) => api<{ heroContent: HeroContent; message: string }>("/api/admin/hero", { method: "POST", body: data }),
  update: (id: string, data: Partial<HeroContent>) => api<{ heroContent: HeroContent; message: string }>(`/api/admin/hero/${id}`, { method: "PATCH", body: data }),
  delete: (id: string) => api<{ message: string }>(`/api/admin/hero/${id}`, { method: "DELETE" }),
};

export const adminReviewsApi = {
  getAll: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const query = searchParams.toString();
    return api<{ reviews: Review[]; totalCount: number }>(`/api/admin/reviews${query ? `?${query}` : ""}`);
  },
  approve: (id: string) => api<{ review: Review; message: string }>(`/api/admin/reviews/${id}`, { method: "PATCH", body: { isApproved: true } }),
  reply: (id: string, adminReply: string) => api<{ review: Review; message: string }>(`/api/admin/reviews/${id}`, { method: "PATCH", body: { adminReply } }),
  delete: (id: string) => api<{ message: string }>(`/api/admin/reviews/${id}`, { method: "DELETE" }),
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
  getCategories: adminCategoriesApi.getAll,
  getCategoryById: adminCategoriesApi.getById,
  createCategory: adminCategoriesApi.create,
  updateCategory: adminCategoriesApi.update,
  deleteCategory: adminCategoriesApi.delete,
  getBrands: adminBrandsApi.getAll,
  createBrand: adminBrandsApi.create,
  updateBrand: adminBrandsApi.update,
  deleteBrand: adminBrandsApi.delete,
  getDeals: adminDealsApi.getAll,
  getDealById: adminDealsApi.getById,
  createDeal: adminDealsApi.create,
  updateDeal: adminDealsApi.update,
  deleteDeal: adminDealsApi.delete,
  getHomepageSections: adminHomepageSectionsApi.getAll,
  createHomepageSection: adminHomepageSectionsApi.create,
  updateHomepageSection: adminHomepageSectionsApi.update,
  deleteHomepageSection: adminHomepageSectionsApi.delete,
  getHeroContent: adminHeroApi.getAll,
  getHeroById: adminHeroApi.getById,
  createHeroContent: adminHeroApi.create,
  updateHeroContent: adminHeroApi.update,
  deleteHeroContent: adminHeroApi.delete,
  getReviews: adminReviewsApi.getAll,
  approveReview: adminReviewsApi.approve,
  replyReview: adminReviewsApi.reply,
  deleteReview: adminReviewsApi.delete,
};
