"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { Product } from "@/lib/api";
import { Plus, Search, Edit, Trash2, Tag, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getProducts({ page, limit: 10, search });
      setProducts(data.products);
      setTotalCount(data.totalCount);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, search]);
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await adminApi.deleteProduct(id);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    }
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-500 text-sm">Manage your product inventory</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} />
          <span>Add Product</span>
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {}
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded focus:outline-none focus:border-green-600"
            />
          </div>
        </div>
        {}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-medium">
              <tr>
                <th className="px-6 py-4 text-left">Product</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">Price</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                       <Loader2 className="animate-spin" size={20} />
                       <span>Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-white transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-white relative rounded overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Tag size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Stock: {(product as any).stock ?? 0}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                       <span className="capitalize">{product.category?.name ?? "—"}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                       {formatPrice(product.basePrice)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.isActive ? "Active" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-400">
                Showing {products.length > 0 ? (page - 1) * 10 + 1 : 0} to {Math.min(page * 10, totalCount)} of {totalCount} results
            </span>
            <div className="flex gap-2">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-white disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    disabled={page * 10 >= totalCount}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-white disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
