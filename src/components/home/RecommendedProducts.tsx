"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { productsApi, Product } from "@/lib/api";
import { Rating } from "@/components/ui";

export function RecommendedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await productsApi.getAll({ limit: 12, sort: "newest" });
        setProducts(data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-6 px-4 md:px-6">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-900">Recommended for you</h2>
          <Link
            href="/products"
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            See more
          </Link>
        </div>

        {/* Product grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl p-3">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3" />
                <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const comparePrice = product.comparePrice;
  const discount = comparePrice
    ? calculateDiscountPercentage(comparePrice, product.basePrice)
    : 0;
  const reviewCount = (product as any)._count?.reviews ?? 0;
  const avgRating = product.reviewStats?.averageRating ?? 0;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="flex flex-col h-full bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        {/* Image container */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden mb-3 rounded-lg flex items-center justify-center">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm text-gray-900 group-hover:text-green-600 line-clamp-2 mb-1 leading-snug transition-colors">
          {product.title}
        </h3>

        {/* Rating */}
        {avgRating > 0 && (
          <div className="mb-1">
            <Rating value={avgRating} size="sm" reviewCount={reviewCount} />
          </div>
        )}

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-lg font-semibold text-gray-900">
              {formatPrice(product.basePrice)}
            </span>
          </div>
          {comparePrice && comparePrice > product.basePrice && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-gray-400 line-through">
                {formatPrice(comparePrice)}
              </span>
              {discount > 0 && (
                <span className="text-red-600 font-medium">
                  ({discount}% off)
                </span>
              )}
            </div>
          )}

          {/* Free delivery tag */}
          <p className="text-xs text-emerald-600 font-medium mt-1">FREE Delivery</p>
        </div>
      </div>
    </Link>
  );
}
