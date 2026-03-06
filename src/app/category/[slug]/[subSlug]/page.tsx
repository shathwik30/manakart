import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { ProductsGrid } from "@/components/products/ProductsGrid";
import { categoryService } from "@/lib/services/category-service";
import { productService } from "@/lib/services/product-service";

interface PageProps {
  params: Promise<{ slug: string; subSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, subSlug } = await params;
  const { category: parent } = await categoryService.getCategoryBySlug(slug);

  if (!parent) {
    return { title: "Category Not Found | ManaKart" };
  }

  const subCategory = parent.children?.find(
    (child: any) => child.slug === subSlug
  );

  if (!subCategory) {
    return { title: "Category Not Found | ManaKart" };
  }

  return {
    title: `${subCategory.name} - ${parent.name} | ManaKart`,
    description: `Browse ${subCategory.name} in ${parent.name} on ManaKart. Find the best deals and prices.`,
  };
}

export default async function SubCategoryPage({ params }: PageProps) {
  const { slug, subSlug } = await params;
  const { category: parent } = await categoryService.getCategoryBySlug(slug);

  if (!parent) {
    notFound();
  }

  const subCategory = parent.children?.find(
    (child: any) => child.slug === subSlug
  );

  if (!subCategory) {
    notFound();
  }

  const { products } = await productService.getProducts({
    categoryId: subCategory.id,
    isActive: true,
    limit: 40,
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f1f3f6]">
        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-[1280px] mx-auto px-4 py-3">
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
              <Link href="/" className="hover:text-green-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link
                href={`/category/${slug}`}
                className="hover:text-green-600 transition-colors"
              >
                {parent.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-900 font-medium">{subCategory.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 py-8">
          {/* Subcategory Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900">{subCategory.name}</h1>
            <p className="text-gray-500 mt-1">
              in{" "}
              <Link
                href={`/category/${slug}`}
                className="text-green-600 hover:underline"
              >
                {parent.name}
              </Link>
              {" "}&middot;{" "}
              {products.length} product{products.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Products Grid */}
          <ProductsGrid products={products} />
        </div>
      </main>
      <Footer />
    </>
  );
}
