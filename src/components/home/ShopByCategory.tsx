"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Grid3X3 } from "lucide-react";
import { categoriesApi, Category } from "@/lib/api";

export function ShopByCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await categoriesApi.getAll({ nav: true });
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (!isLoading && categories.length === 0) {
    return null;
  }

  return (
    <section className="py-6 px-4 md:px-6">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-900">Shop by Category</h2>
          <Link
            href="/products"
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            See more
          </Link>
        </div>

        {/* Category grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-100 rounded-xl mb-3" />
                <div className="h-4 bg-gray-100 rounded w-2/3 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group block"
    >
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : category.icon ? (
            <div className="text-5xl">{category.icon}</div>
          ) : (
            <Grid3X3 className="w-12 h-12 text-gray-300" />
          )}
        </div>

        {/* Name */}
        <div className="px-3 py-3">
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
            {category.name}
          </h3>
          {category._count?.products !== undefined && category._count.products > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">
              {category._count.products} product{category._count.products !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
