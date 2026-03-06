"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/adminApi";
import { Deal, Product } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface DealFormProps {
  initialData?: Deal | null;
  isEdit?: boolean;
}

export function DealForm({ initialData, isEdit }: DealFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [formData, setFormData] = useState({
    productId: "",
    dealPrice: "",
    startsAt: "",
    endsAt: "",
    isActive: true,
    position: "0",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const data = await adminApi.getProducts();
        setProducts(data.products);
      } catch {
        toast.error("Failed to load products");
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        productId: initialData.productId,
        dealPrice: String(initialData.dealPrice / 100),
        startsAt: initialData.startsAt
          ? new Date(initialData.startsAt).toISOString().slice(0, 16)
          : "",
        endsAt: initialData.endsAt
          ? new Date(initialData.endsAt).toISOString().slice(0, 16)
          : "",
        isActive: initialData.isActive,
        position: String(initialData.position),
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId) {
      toast.error("Please select a product");
      return;
    }
    if (!formData.dealPrice) {
      toast.error("Please enter a deal price");
      return;
    }
    if (!formData.startsAt || !formData.endsAt) {
      toast.error("Please set start and end dates");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        productId: formData.productId,
        dealPrice: Math.round(Number(formData.dealPrice) * 100),
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: new Date(formData.endsAt).toISOString(),
        isActive: formData.isActive,
        position: Number(formData.position),
      };

      if (isEdit && initialData) {
        await adminApi.updateDeal(initialData.id, payload);
        toast.success("Deal updated");
      } else {
        await adminApi.createDeal(payload);
        toast.success("Deal created");
      }
      router.push("/admin/deals");
    } catch (error) {
      toast.error(isEdit ? "Failed to update deal" : "Failed to create deal");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/deals"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Deals
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900">
          {isEdit ? "Edit Deal" : "Create Deal"}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Product *
            </label>
            {productsLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                Loading products...
              </div>
            ) : (
              <select
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600"
                value={formData.productId}
                onChange={(e) =>
                  setFormData({ ...formData, productId: e.target.value })
                }
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title} — {formatPrice(product.basePrice)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Deal Price (in Rupees) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="e.g. 999"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600"
                value={formData.dealPrice}
                onChange={(e) =>
                  setFormData({ ...formData, dealPrice: e.target.value })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter price in rupees. It will be stored in paise.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Position
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Starts At *
              </label>
              <input
                type="datetime-local"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600"
                value={formData.startsAt}
                onChange={(e) =>
                  setFormData({ ...formData, startsAt: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Ends At *
              </label>
              <input
                type="datetime-local"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600"
                value={formData.endsAt}
                onChange={(e) =>
                  setFormData({ ...formData, endsAt: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, isActive: !formData.isActive })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isActive ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <label className="text-sm text-gray-900">
              {formData.isActive ? "Active" : "Inactive"}
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {isEdit ? "Update Deal" : "Create Deal"}
            </button>
            <Link
              href="/admin/deals"
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
