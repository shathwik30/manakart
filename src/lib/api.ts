const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const isServer = typeof window === "undefined";
function getBaseUrl() {
  if (isServer) {
    return process.env.API_URL || "http://localhost:3000";
  }
  return API_BASE_URL;
}
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}
async function api<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;
  const config: RequestInit = {
    method,
    headers: { ...headers },
    credentials: "include",
    ...(isServer && { cache: "no-store" }),
  };
  if (body instanceof FormData) {
    config.body = body;
  } else if (body !== undefined) {
    config.body = JSON.stringify(body);
    config.headers = { ...config.headers, "Content-Type": "application/json" };
  }
  try {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, config);
    const data: ApiResponse<T> = await response.json();
    if (!response.ok || !data.success) {
      throw new ApiError(data.error || "Something went wrong", response.status, data);
    }
    return data.data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Network error. Please try again.", 0);
  }
}

// ─── Auth ───

export const authApi = {
  sendOtp: (email: string) =>
    api<{ message: string }>("/api/auth/send-otp", { method: "POST", body: { email } }),
  verifyOtp: (data: { email: string; otp: string; name?: string; phone?: string }) =>
    api<{ message: string; user: User; isNewUser: boolean; needsRegistration?: boolean }>("/api/auth/verify-otp", {
      method: "POST",
      body: data,
    }),
  getMe: () => api<{ user: User }>("/api/auth/me"),
  logout: () => api<{ message: string }>("/api/auth/logout", { method: "POST" }),
};

// ─── Products ───

export const productsApi = {
  getAll: (params?: {
    categoryId?: string;
    brandId?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) searchParams.set("categoryId", params.categoryId);
    if (params?.brandId) searchParams.set("brandId", params.brandId);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.sort) searchParams.set("sort", params.sort);
    if (params?.minPrice !== undefined) searchParams.set("minPrice", String(params.minPrice));
    if (params?.maxPrice !== undefined) searchParams.set("maxPrice", String(params.maxPrice));
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const query = searchParams.toString();
    return api<{ products: Product[]; pagination: Pagination }>(`/api/products${query ? `?${query}` : ""}`);
  },
  getById: (id: string) => api<{ product: Product }>(`/api/products/${id}`),
  getBySlug: (slug: string) => api<{ product: Product }>(`/api/products/${slug}`),
};

// ─── Categories ───

export const categoriesApi = {
  getAll: (params?: { nav?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.nav) searchParams.set("nav", "true");
    const query = searchParams.toString();
    return api<{ categories: Category[] }>(`/api/categories${query ? `?${query}` : ""}`);
  },
  getBySlug: (slug: string) => api<{ category: Category; products: Product[]; pagination: Pagination }>(`/api/categories/${slug}`),
};

// ─── Brands ───

export const brandsApi = {
  getAll: () => api<{ brands: Brand[] }>("/api/brands"),
};

// ─── Deals ───

export const dealsApi = {
  getActive: () => api<{ deals: Deal[] }>("/api/deals"),
};

// ─── Search ───

export const searchApi = {
  search: (params: {
    q: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    searchParams.set("q", params.q);
    if (params.categoryId) searchParams.set("categoryId", params.categoryId);
    if (params.brandId) searchParams.set("brandId", params.brandId);
    if (params.minPrice !== undefined) searchParams.set("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined) searchParams.set("maxPrice", String(params.maxPrice));
    if (params.sort) searchParams.set("sort", params.sort);
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    return api<{ products: Product[]; pagination: Pagination }>(`/api/search?${searchParams.toString()}`);
  },
};

// ─── Reviews ───

export const reviewsApi = {
  getForProduct: (productId: string, params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const query = searchParams.toString();
    return api<{ reviews: Review[]; stats: ReviewStats; pagination: Pagination }>(
      `/api/products/${productId}/reviews${query ? `?${query}` : ""}`
    );
  },
  create: (productId: string, data: { rating: number; title?: string; comment?: string }) =>
    api<{ review: Review; message: string }>(`/api/products/${productId}/reviews`, {
      method: "POST",
      body: data,
    }),
};

// ─── Homepage ───

export const homepageApi = {
  getSections: () => api<{ sections: HomepageSection[] }>("/api/homepage/sections"),
};

// ─── Cart ───

export const cartApi = {
  get: () => api<CartResponse>("/api/cart"),
  addItem: (data: { productId: string; variantId?: string; quantity?: number }) =>
    api<{ message: string }>("/api/cart/add", { method: "POST", body: data }),
  updateItem: (itemId: string, data: { quantity: number }) =>
    api<{ item: CartItem; message: string }>(`/api/cart/${itemId}`, { method: "PATCH", body: data }),
  removeItem: (itemId: string) =>
    api<{ message: string }>(`/api/cart/${itemId}`, { method: "DELETE" }),
};

// ─── Checkout ───

export const checkoutApi = {
  init: (data: CheckoutInitData) =>
    api<{ checkoutSession: CheckoutSession }>("/api/checkout/init", { method: "POST", body: data }),
  applyCoupon: (code: string, subtotal: number) =>
    api<{ coupon: Coupon; discount: number; message: string }>("/api/checkout/apply-coupon", {
      method: "POST",
      body: { code, subtotal },
    }),
  createPayment: (data: CreatePaymentData) =>
    api<PaymentResponse>("/api/checkout/create-payment", { method: "POST", body: data }),
  verify: (data: VerifyPaymentData) =>
    api<{ message: string; order: Order }>("/api/checkout/verify", { method: "POST", body: data }),
};

// ─── Account ───

export const accountApi = {
  getProfile: () => api<{ user: User }>("/api/account/profile"),
  updateProfile: (data: { name?: string; phone?: string }) =>
    api<{ user: User; message: string }>("/api/account/profile", { method: "PATCH", body: data }),
  getAddresses: () => api<{ addresses: Address[] }>("/api/account/addresses"),
  addAddress: (data: AddressInput) =>
    api<{ address: Address; message: string }>("/api/account/addresses", { method: "POST", body: data }),
  updateAddress: (id: string, data: Partial<AddressInput>) =>
    api<{ address: Address; message: string }>(`/api/account/addresses/${id}`, { method: "PATCH", body: data }),
  deleteAddress: (id: string) =>
    api<{ message: string }>(`/api/account/addresses/${id}`, { method: "DELETE" }),
  getOrders: (params?: { page?: number; limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.status) searchParams.set("status", params.status);
    const query = searchParams.toString();
    return api<{ orders: Order[]; pagination: Pagination }>(`/api/account/orders${query ? `?${query}` : ""}`);
  },
  getOrder: (id: string) => api<{ order: OrderDetail }>(`/api/account/orders/${id}`),
};

// ─── Landing ───

export const landingApi = {
  getHero: () => api<{ heroContent: HeroContent[] }>("/api/landing/hero"),
  getReviews: (params?: { featured?: boolean; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.featured !== undefined) searchParams.set("featured", String(params.featured));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const query = searchParams.toString();
    return api<{ reviews: Review[]; stats: ReviewStats }>(`/api/landing/reviews${query ? `?${query}` : ""}`);
  },
};

// ─── Types ───

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: "USER" | "ADMIN";
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  image?: string | null;
  showInNav: boolean;
  position: number;
  isActive: boolean;
  parentId?: string | null;
  parent?: { id: string; name: string; slug: string } | null;
  children?: Category[];
  _count?: { products: number };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  isActive: boolean;
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface ProductOption {
  id: string;
  name: string;
  position: number;
  values: ProductOptionValue[];
}

export interface ProductOptionValue {
  id: string;
  value: string;
  position: number;
}

export interface ProductVariant {
  id: string;
  sku?: string | null;
  price: number;
  comparePrice?: number | null;
  stock: number;
  images: string[];
  optionValues: { optionName: string; valueName: string }[];
  isActive: boolean;
  position: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  basePrice: number;
  comparePrice?: number | null;
  images: string[];
  stock: number;
  sku?: string | null;
  specifications?: ProductSpecification[] | unknown | null;
  hasVariants?: boolean;
  options?: ProductOption[];
  variants?: ProductVariant[];
  isFeatured: boolean;
  isActive: boolean;
  categoryId?: string | null;
  brandId?: string | null;
  category?: { id: string; name: string | null; slug: string | null } | Category | null;
  brand?: { id: string; name: string | null; slug: string | null } | Brand | null;
  reviewStats?: ReviewStats;
}

export interface Deal {
  id: string;
  productId: string;
  dealPrice: number;
  startsAt: string | Date;
  endsAt: string | Date;
  isActive: boolean;
  position: number;
  product: Product;
}

export interface HomepageSection {
  id: string;
  type: string;
  title: string;
  config?: Record<string, unknown> | null;
  position: number;
  isActive: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  variant?: ProductVariant | null;
  quantity: number;
  price: number;
}

export interface CartResponse {
  cart: { id: string; userId?: string; sessionId?: string } | null;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface Address {
  id: string;
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface AddressInput {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface CheckoutInitData {
  address?: AddressInput;
  savedAddressId?: string;
}

export interface CheckoutSession {
  cartId: string;
  address: AddressInput;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  requiresOtp: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "FLAT" | "PERCENTAGE";
  value: number;
  minOrderValue?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  expiresAt?: string | null;
  isActive: boolean;
}

export interface CreatePaymentData {
  cartId: string;
  address: AddressInput;
  couponCode?: string;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
}

export interface PaymentResponse {
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
  orderNumber: string;
  checkoutData: Record<string, unknown>;
}

export interface VerifyPaymentData {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  checkoutData: Record<string, unknown>;
}

export interface Order {
  id: string;
  orderNumber: string;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  orderStatus: "CREATED" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  items: OrderItem[];
  user?: User;
}

export interface OrderItem {
  id: string;
  productTitle: string;
  size?: string | null;
  variantSnapshot?: { sku?: string; optionValues: { optionName: string; valueName: string }[] } | null;
  productImage?: string | null;
  quantity: number;
  price: number;
  product: Product;
}

export interface OrderDetail extends Order {
  paymentId?: string;
  paymentMethod?: string;
  addressSnapshot: AddressInput;
  coupon?: Coupon;
}

export interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface HeroContent {
  id: string;
  title: string;
  subtitle?: string | null;
  image: string;
  ctaText?: string | null;
  ctaLink?: string | null;
  isActive: boolean;
  position: number;
  createdAt: Date | string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  title?: string | null;
  rating: number;
  comment?: string | null;
  media: string[];
  adminReply?: string | null;
  isFeatured: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: Record<string, number>;
}

export default api;
