"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { Category } from "@/lib/api";
import { Plus, Edit, Trash2, Loader2, FolderTree } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCategories();
      setCategories(data.categories);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await adminApi.deleteCategory(id);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const totalCount = categories.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const paginatedCategories = categories.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Categories</h1>
          <p className="text-gray-500 text-sm">
            Manage your product categories
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={18} />
          <span>Add Category</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-medium">
              <tr>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Slug</th>
                <th className="px-6 py-4 text-left">Parent</th>
                <th className="px-6 py-4 text-left">Nav</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Loading categories...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FolderTree size={32} className="text-gray-300" />
                      <span>No categories found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {category.icon && (
                          <span className="text-lg">{category.icon}</span>
                        )}
                        <span className="font-medium text-gray-900">
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {category.parent?.name || "\u2014"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.showInNav
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {category.showInNav ? "Visible" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/categories/${category.id}`}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(category.id)}
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

        {totalCount > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing{" "}
              {paginatedCategories.length > 0
                ? (page - 1) * ITEMS_PER_PAGE + 1
                : 0}{" "}
              to {Math.min(page * ITEMS_PER_PAGE, totalCount)} of {totalCount}{" "}
              results
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
