
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { ProductDetail } from "@/components/products/ProductDetail";
import { productService } from "@/lib/services/product-service";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { product } = await productService.getProductBySlug(slug);
    if (!product) return { title: "Product Not Found" };
    
    return {
      title: product.title,
      description: product.description || `Shop ${product.title} at Succession`,
    };
  } catch {
    return { title: "Product Not Found" };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  let product;
  try {
    const data = await productService.getProductBySlug(slug);
    product = data.product;
  } catch {
    notFound();
  }
  if (!product) {
    notFound();
  }
  return (
    <>
      <Header />
      <ProductDetail product={product} />
      <Footer />
    </>
  );
}