import { Metadata } from "next";
import { Header, Footer } from "@/components/layout";
import { ProductsGrid } from "@/components/products/ProductsGrid";
import { productsApi, Product } from "@/lib/api";

export const metadata: Metadata = {
  title: "All Products",
  description: "Explore our exquisite collection of luxury fashion pieces.",
};

export default async function ProductsPage() {
  let products: Product[] = [];

  try {
    const data = await productsApi.getAll();
    products = data.products;
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  return (
    <>
      <Header />

      <main className="pt-32 pb-20 bg-cream-100">
        <div className="container-luxury">
          <div className="text-center mb-12">
            <p className="overline text-gold-600 mb-4">Shop</p>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal-900 mb-6">
              All Products
            </h1>
            <p className="text-charcoal-600 max-w-2xl mx-auto">
              Discover our complete range of luxury pieces, each crafted with
              exceptional attention to detail.
            </p>
          </div>

          <ProductsGrid products={products} />
        </div>
      </main>

      <Footer />
    </>
  );
}