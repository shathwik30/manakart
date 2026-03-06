"use client";
import { useEffect, useState, use } from "react";
import { DealForm } from "@/components/admin/DealForm";
import { adminApi } from "@/lib/adminApi";
import { Deal } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function EditDealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const data = await adminApi.getDealById(id);
        setDeal(data.deal);
      } catch {
        toast.error("Failed to load deal");
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="text-center py-12 text-gray-500">Deal not found</div>
    );
  }

  return <DealForm initialData={deal} isEdit />;
}
