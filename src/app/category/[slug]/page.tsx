import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductsGrid } from "@/components/products/ProductsGrid";
import { categoryService } from "@/lib/services/category-service";
import { productService } from "@/lib/services/product-service";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await categoryService.getCategoryBySlug(slug);

  if (!category) {
    return { title: "Category Not Found | ManaKart" };
  }

  return {
    title: `${category.name} | ManaKart`,
    description: `Browse ${category.name} products on ManaKart. Find the best deals and prices.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const { category } = await categoryService.getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const children = category.children || [];

  // For parent categories, include products from all subcategories
  const categoryIds = children.length > 0
    ? [category.id, ...children.map((c: any) => c.id)]
    : undefined;

  const { products } = await productService.getProducts({
    categoryId: children.length > 0 ? undefined : category.id,
    categoryIds,
    isActive: true,
    limit: 40,
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f1f3f6]">
        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-[1280px] mx-auto px-4 py-2">
            <nav className="flex items-center gap-1 text-sm text-gray-500">
              <Link href="/" className="text-green-600 hover:text-green-700 hover:underline">
                Home
              </Link>
              <ChevronRight className="w-3 h-3 text-gray-500" />
              <span className="text-gray-900">{category.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 py-4">
          {/* Category Header */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">{category.name}</h1>
            {products.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {products.length} result{products.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Subcategory Links */}
          {children.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Shop by subcategory
              </h2>
              <div className="flex flex-wrap gap-2">
                {children.map((child: any) => (
                  <Link
                    key={child.id}
                    href={`/category/${child.slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-900 hover:bg-gray-200 transition-colors"
                  >
                    {child.name}
                    {child._count?.products !== undefined && (
                      <span className="text-xs text-gray-500">
                        ({child._count.products})
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <ProductsGrid products={products} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
