"use client";
import { useEffect, useState, use } from "react";
import CategoryForm from "@/components/admin/CategoryForm";
import { adminApi } from "@/lib/adminApi";
import { Category } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await adminApi.getCategoryById(id);
        setCategory(data.category);
      } catch {
        toast.error("Failed to load category");
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-gray-500">
        Category not found
      </div>
    );
  }

  return <CategoryForm initialData={category} isEdit />;
}
