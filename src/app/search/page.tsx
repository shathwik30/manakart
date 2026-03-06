"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  X,
  Star,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { cn, formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { searchApi, categoriesApi, brandsApi, Product, Category, Brand, Pagination } from "@/lib/api";
import { ProductFilters } from "@/components/products/ProductFilters";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";

const sortOptions = [
  { label: "Relevance", value: "" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest Arrivals", value: "newest" },
  { label: "Name: A to Z", value: "name_asc" },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("q") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const brandId = searchParams.get("brandId") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const [catData, brandData] = await Promise.all([
          categoriesApi.getAll({ nav: true }),
          brandsApi.getAll(),
        ]);
        setCategories(catData.categories || []);
        setBrands(brandData.brands || []);
      } catch {
        // Silent fail for filter options
      }
    }
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      try {
        const data = await searchApi.search({
          q: query,
          categoryId: categoryId || undefined,
          brandId: brandId || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          sort: sort || undefined,
          page,
          limit: 20,
        });
        setProducts(data.products || []);
        setPagination(data.pagination || null);
      } catch {
        setProducts([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResults();
  }, [query, categoryId, brandId, minPrice, maxPrice, sort, page]);

  const updateSearchParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      if (!updates.page) {
        params.delete("page");
      }
      router.push(`/search?${params.toString()}`);
    },
    [searchParams, router]
  );

  const handleFilterChange = (filters: any) => {
    updateSearchParams({
      categoryId: filters.categoryId || "",
      brandId: filters.brandId || "",
      minPrice: filters.minPrice ? String(filters.minPrice) : "",
      maxPrice: filters.maxPrice ? String(filters.maxPrice) : "",
    });
    setShowMobileFilters(false);
  };

  const handleSortChange = (value: string) => {
    updateSearchParams({ sort: value });
  };

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: String(newPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAllFilters = () => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const hasActiveFilters = categoryId || brandId || minPrice || maxPrice;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f1f3f6]">
        {/* Results Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-[1280px] mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {pagination && (
                <span>
                  {pagination.totalCount > 0 ? (
                    <>
                      1-{Math.min(page * 20, pagination.totalCount)} of over {pagination.totalCount} results
                      {query && (
                        <>
                          {" "}for{" "}
                          <span className="text-green-700 font-semibold">&quot;{query}&quot;</span>
                        </>
                      )}
                    </>
                  ) : (
                    <>No results{query && <> for &quot;{query}&quot;</>}</>
                  )}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Sort by:</label>
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-100 px-2 py-1.5 focus:outline-none focus:border-green-600 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 py-4">
          <div className="flex gap-5">
            {/* Sidebar Filters (Desktop) */}
            <aside className="hidden lg:block w-[245px] flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <ProductFilters
                  categories={categories}
                  brands={brands}
                  onFilterChange={handleFilterChange}
                  currentFilters={{
                    categoryId,
                    brandId,
                    minPrice: minPrice ? Number(minPrice) : undefined,
                    maxPrice: maxPrice ? Number(maxPrice) : undefined,
                  }}
                />
              </div>
            </aside>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden fixed bottom-4 right-4 z-40">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-full shadow-lg text-sm font-medium"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Mobile Filter Panel */}
            {showMobileFilters && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setShowMobileFilters(false)}
                />
                <div className="absolute inset-y-0 left-0 w-80 max-w-full bg-white shadow-xl overflow-y-auto">
                  <div className="sticky top-0 bg-gray-800 px-4 py-3 flex items-center justify-between z-10">
                    <h2 className="font-semibold text-white text-sm">Filters</h2>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-1 text-white hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <ProductFilters
                      categories={categories}
                      brands={brands}
                      onFilterChange={handleFilterChange}
                      currentFilters={{
                        categoryId,
                        brandId,
                        minPrice: minPrice ? Number(minPrice) : undefined,
                        maxPrice: maxPrice ? Number(maxPrice) : undefined,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Products */}
            <div className="flex-1 min-w-0">
              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="mb-3 flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-green-600 hover:text-green-700 hover:underline"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <SearchProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1 mt-8 mb-4">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors",
                          page <= 1
                            ? "text-gray-300 border-gray-200 cursor-not-allowed"
                            : "text-gray-900 border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter((p) => {
                          if (pagination.totalPages <= 7) return true;
                          if (p === 1 || p === pagination.totalPages) return true;
                          if (Math.abs(p - page) <= 1) return true;
                          return false;
                        })
                        .map((p, idx, arr) => {
                          const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                          return (
                            <span key={p} className="flex items-center">
                              {showEllipsis && (
                                <span className="px-1.5 text-gray-500">...</span>
                              )}
                              <button
                                onClick={() => handlePageChange(p)}
                                className={cn(
                                  "w-9 h-9 flex items-center justify-center text-sm rounded-lg border transition-colors",
                                  p === page
                                    ? "bg-gray-900 border-gray-900 text-white font-semibold"
                                    : "text-gray-900 border-gray-200 hover:bg-gray-50"
                                )}
                              >
                                {p}
                              </button>
                            </span>
                          );
                        })}
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= (pagination?.totalPages || 1)}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors",
                          page >= (pagination?.totalPages || 1)
                            ? "text-gray-300 border-gray-200 cursor-not-allowed"
                            : "text-gray-900 border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
                  <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                    {query
                      ? `We couldn't find any results for "${query}". Try checking your spelling or use more general terms.`
                      : "Try searching for a product or browse our categories."}
                  </p>
                  <Link
                    href="/"
                    className="inline-block px-6 py-2 text-sm bg-gray-900 rounded-lg text-white hover:bg-gray-800 transition-colors"
                  >
                    Go to ManaKart Home
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function SearchProductCard({ product }: { product: Product }) {
  const { addItem, isLoading } = useCartStore();
  const stock = (product as any).stock ?? 0;
  const isOutOfStock = stock === 0;
  const comparePrice = product.comparePrice;
  const discount = comparePrice
    ? calculateDiscountPercentage(comparePrice, product.basePrice)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    await addItem({ productId: product.id, quantity: 1 });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-200" />
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-lg">
              Out of Stock
            </div>
          )}
          {discount > 0 && !isOutOfStock && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-lg">
              {discount}% off
            </div>
          )}
        </div>

        {/* Info */}
        <h3 className="text-sm text-gray-900 line-clamp-2 mb-1 group-hover:text-green-600 transition-colors">
          {product.title}
        </h3>

        {product.brand?.name && (
          <p className="text-xs text-gray-500 mb-1">
            by {product.brand.name}
          </p>
        )}

        {/* Rating placeholder */}
        {(product as any).avgRating && (
          <div className="flex items-center gap-1 mb-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3.5 h-3.5",
                    i < Math.round((product as any).avgRating)
                      ? "fill-amber-500 text-amber-500"
                      : "text-gray-200"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="mt-1">
          <span className="text-lg font-semibold text-gray-900">
            {formatPrice(product.basePrice)}
          </span>
          {comparePrice && comparePrice > product.basePrice && (
            <span className="ml-2 text-sm text-gray-500 line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>
      </Link>

      {/* Add to Cart */}
      {!isOutOfStock && (
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs bg-gray-900 rounded-lg text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Add to Cart
        </button>
      )}
    </div>
  );
}
