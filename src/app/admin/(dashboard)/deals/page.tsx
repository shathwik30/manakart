"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { Deal } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function AdminDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDeals();
      setDeals(data.deals);
    } catch {
      toast.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    try {
      await adminApi.deleteDeal(id);
      toast.success("Deal deleted");
      fetchDeals();
    } catch {
      toast.error("Failed to delete deal");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">Deals</h1>
          <p className="text-gray-500 text-sm">Manage product deals and offers</p>
        </div>
        <Link
          href="/admin/deals/new"
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={18} />
          <span>Add Deal</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-green-600" size={30} />
          </div>
        ) : deals.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No deals found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal Price
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {deal.product?.title || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatPrice(deal.dealPrice)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(deal.startsAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(deal.endsAt)}
                    </td>
                    <td className="px-6 py-4">
                      {deal.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/deals/${deal.id}`}
                          className="p-2 text-gray-400 hover:text-green-600 rounded transition-colors"
                          title="Edit deal"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(deal.id)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded transition-colors"
                          title="Delete deal"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
