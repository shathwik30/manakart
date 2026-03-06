"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ChevronDown } from "lucide-react";
import { cn, formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { Rating } from "@/components/ui";
import { Product, Category, Brand, categoriesApi, brandsApi } from "@/lib/api";
import { ProductFilters } from "@/components/products/ProductFilters";

interface ProductsGridProps {
  products: Product[];
  totalCount?: number;
}

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Avg. Customer Review", value: "rating" },
  { label: "Newest Arrivals", value: "newest" },
];

interface FilterValues {
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
}

export function ProductsGrid({ products, totalCount }: ProductsGridProps) {
  const [sortBy, setSortBy] = useState("featured");
  const [filters, setFilters] = useState<FilterValues>({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    async function loadFilters() {
      try {
        const [catData, brandData] = await Promise.all([
          categoriesApi.getAll(),
          brandsApi.getAll(),
        ]);
        setCategories(catData.categories || []);
        setBrands(brandData.brands || []);
      } catch {
        // Filters will just be empty
      }
    }
    loadFilters();
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = [...products];

    // Apply filters
    if (filters.categoryId) {
      result = result.filter((p) => p.categoryId === filters.categoryId);
    }
    if (filters.brandId) {
      result = result.filter((p) => p.brandId === filters.brandId);
    }
    if (filters.minPrice !== undefined) {
      result = result.filter((p) => p.basePrice >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter((p) => p.basePrice <= filters.maxPrice!);
    }
    if (filters.rating) {
      result = result.filter(
        (p) => (p.reviewStats?.averageRating || 0) >= filters.rating!
      );
    }
    if (filters.inStock) {
      result = result.filter((p) => p.stock > 0);
    }

    // Sort
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price_desc":
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date((b as any).createdAt || 0).getTime() -
            new Date((a as any).createdAt || 0).getTime()
        );
        break;
      case "rating":
        result.sort(
          (a, b) =>
            (b.reviewStats?.averageRating || 0) -
            (a.reviewStats?.averageRating || 0)
        );
        break;
      default:
        // featured — keep default order
        break;
    }

    return result;
  }, [products, sortBy, filters]);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex gap-4">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[250px] flex-shrink-0">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <ProductFilters
            categories={categories}
            brands={brands}
            onFilterChange={handleFilterChange}
            currentFilters={filters}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-sm text-gray-500">
              1-{filteredAndSorted.length} of{" "}
              <span className="font-bold text-gray-900">
                {totalCount || filteredAndSorted.length}
              </span>{" "}
              results
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50"
            >
              Filters
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {/* Sort dropdown */}
            <div className="flex items-center">
              <label className="text-sm text-gray-900 mr-2 hidden sm:inline">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 shadow-sm cursor-pointer"
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

        {/* Mobile filters panel */}
        {showMobileFilters && (
          <div className="lg:hidden bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-3">
            <ProductFilters
              categories={categories}
              brands={brands}
              onFilterChange={handleFilterChange}
              currentFilters={filters}
            />
          </div>
        )}

        {/* Product Grid */}
        {filteredAndSorted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAndSorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-50 rounded-full">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              No results found
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Try adjusting your filters or search terms.
            </p>
            <Link
              href="/products"
              className="inline-block text-sm text-green-600 hover:text-green-700 hover:underline"
            >
              Clear all filters
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const stock = product.stock ?? 0;
  const isOutOfStock = stock === 0;
  const comparePrice = product.comparePrice;
  const discount =
    comparePrice && comparePrice > product.basePrice
      ? calculateDiscountPercentage(comparePrice, product.basePrice)
      : 0;
  const reviewCount = (product as any)._count?.reviews || product.reviewStats?.totalReviews || 0;
  const avgRating = product.reviewStats?.averageRating || 0;

  return (
    <Link href={`/product/${product.slug}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 p-4 flex items-center justify-center overflow-hidden rounded-t-xl">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-contain p-3 group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <ShoppingBag className="w-16 h-16 text-gray-300" />
          )}
          {isOutOfStock && (
            <div className="absolute top-2 left-2 bg-gray-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
              Out of Stock
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-3 pt-2 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-sm text-gray-900 group-hover:text-green-600 line-clamp-2 mb-1 leading-5">
            {product.title}
          </h3>

          {/* Brand */}
          {product.brand?.name && (
            <p className="text-xs text-gray-500 mb-1">
              by {product.brand.name}
            </p>
          )}

          {/* Rating */}
          {avgRating > 0 && (
            <div className="flex items-center gap-1 mb-1">
              <Rating value={avgRating} size="sm" />
              <span className="text-xs text-green-600">
                {reviewCount.toLocaleString()}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-auto">
            <div className="flex items-baseline gap-1">
              <span className="text-[11px] text-gray-900 align-top relative -top-1.5">
                &#x20B9;
              </span>
              <span className="text-xl font-medium text-gray-900">
                {Math.floor(product.basePrice / 100).toLocaleString("en-IN")}
              </span>
              {product.basePrice % 100 > 0 && (
                <span className="text-[11px] text-gray-900 align-top relative -top-1.5">
                  {String(product.basePrice % 100).padStart(2, "0")}
                </span>
              )}
            </div>
            {comparePrice && comparePrice > product.basePrice && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500 line-through">
                  {formatPrice(comparePrice)}
                </span>
                <span className="text-xs font-bold text-red-600">
                  ({discount}% off)
                </span>
              </div>
            )}
          </div>

          {/* Delivery */}
          {!isOutOfStock && (
            <p className="text-xs text-emerald-600 mt-1.5 font-medium">
              FREE Delivery by ManaKart
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
