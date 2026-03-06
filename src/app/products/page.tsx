
import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductsGrid } from "@/components/products/ProductsGrid";
import { productService } from "@/lib/services/product-service";
import { Product } from "@/lib/api";

export const metadata: Metadata = {
  title: "All Products | ManaKart",
  description: "Browse our wide range of products at great prices.",
};

export default async function ProductsPage() {
  let products: Product[] = [];
  let totalCount = 0;
  try {
    const data = await productService.getProducts({ limit: 100 });
    products = data.products as unknown as Product[];
    totalCount = data.pagination.totalCount;
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  return (
    <>
      <Header />
      <main className="bg-[#f1f3f6] min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 py-4">
          <ProductsGrid products={products} totalCount={totalCount} />
        </div>
      </main>
      <Footer />
    </>
  );
}
