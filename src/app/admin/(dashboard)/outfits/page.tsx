"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { Outfit } from "@/lib/api";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

export default function AdminOutfits() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchOutfits = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getOutfits({ page, limit: 12 });
      setOutfits(data.outfits);
      setTotalCount(data.totalCount);
    } catch {
      toast.error("Failed to load outfits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfits();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this outfit?")) return;

    try {
      await adminApi.deleteOutfit(id);
      toast.success("Outfit deleted");
      fetchOutfits();
    } catch {
      toast.error("Failed to delete outfit");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-[#1A1A1A] mb-2">Outfits</h1>
          <p className="text-[#8C7B75] text-sm">Curated collections</p>
        </div>
        <Link
          href="/admin/outfits/new"
          className="flex items-center gap-2 bg-[#1A1A1A] text-[#FAF6F0] px-4 py-2 rounded hover:bg-[#2C2C2C] transition-colors"
        >
          <Plus size={18} />
          <span>Create Outfit</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
             <div className="col-span-full flex justify-center py-12">
              <Loader2 className="animate-spin text-[#C9A227]" size={30} />
           </div>
        ) : outfits.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center border border-[#E0E0E0] rounded-lg">
              <p className="text-[#888]">No outfits found.</p>
           </div>
        ) : (
            outfits.map((outfit) => (
                <div key={outfit.id} className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden group">
                    <div className="aspect-[3/4] relative bg-[#F0F0F0]">
                        {outfit.heroImages?.[0] && (
                            <Image
                                src={outfit.heroImages[0]}
                                alt={outfit.title}
                                fill
                                className="object-cover"
                            />
                        )}
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button
                                onClick={() => handleDelete(outfit.id)}
                                className="p-2 bg-white rounded-full text-[#555] hover:text-red-500 shadow-sm"
                             >
                                <Trash2 size={16} />
                             </button>
                        </div>
                        {outfit.isFeatured && (
                            <div className="absolute top-2 left-2 bg-[#C9A227] text-white text-[10px] uppercase font-bold px-2 py-1 rounded">
                                Featured
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <h3 className="font-serif text-lg text-[#1A1A1A] mb-1">{outfit.title}</h3>
                        <div className="flex justify-between items-center">
                            <span className="text-[#8C7B75] text-sm">{outfit.genderType}</span>
                            <span className="font-bold text-[#1A1A1A]">{formatPrice(outfit.bundlePrice)}</span>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>

      {}
      {totalCount > 12 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 bg-white border border-[#E0E0E0] rounded hover:bg-[#F5F5F5] disabled:opacity-50"
            >
                Previous
            </button>
            <button
                disabled={page * 12 >= totalCount}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-white border border-[#E0E0E0] rounded hover:bg-[#F5F5F5] disabled:opacity-50"
            >
                Next
            </button>
        </div>
      )}
    </div>
  );
}
