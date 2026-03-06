"use client";
import { useEffect, useState, use } from "react";
import ProductForm from "@/components/admin/ProductForm";
import { adminApi } from "@/lib/adminApi";
import { Product } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await adminApi.getProducts({ search: "" }); 
      } catch (error) {
      }
    };
  }, [id]);
  useEffect(() => {
    const fetch = async () => {
       try {
         const data = await adminApi.getProduct(id);
         setProduct(data.product);
       } catch {
         toast.error("Failed to load product");
       } finally {
         setLoading(false);
       }
    };
    fetch();
  }, [id]);
  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }
  if (!product) {
    return <div>Product not found</div>;
  }
  return <ProductForm initialData={product} isEdit />;
}
