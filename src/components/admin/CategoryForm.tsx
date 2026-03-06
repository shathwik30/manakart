"use client";
import { useState, useEffect } from "react";
import { Category } from "@/lib/api";
import { adminApi } from "@/lib/adminApi";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";

interface CategoryFormProps {
  initialData?: Category;
  isEdit?: boolean;
}

export default function CategoryForm({
  initialData,
  isEdit = false,
}: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    parentId: initialData?.parentId || "",
    icon: initialData?.icon || "",
    image: initialData?.image || "",
    showInNav: initialData?.showInNav ?? true,
    position: initialData?.position ?? 0,
    isActive: initialData?.isActive ?? true,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await adminApi.getCategories();
        setCategories(data.categories);
      } catch {
        // silent
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? parseInt(value) || 0 : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };

      // Auto-generate slug from name if slug hasn't been manually edited
      if (name === "name" && !slugManuallyEdited) {
        updated.slug = slugify(value);
      }

      return updated;
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!formData.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        parentId: formData.parentId || null,
        icon: formData.icon.trim() || null,
        image: formData.image.trim() || null,
        showInNav: formData.showInNav,
        position: formData.position,
        isActive: formData.isActive,
      };

      if (isEdit && initialData) {
        await adminApi.updateCategory(initialData.id, payload);
        toast.success("Category updated successfully");
      } else {
        await adminApi.createCategory(payload);
        toast.success("Category created successfully");
      }

      router.push("/admin/categories");
      router.refresh();
    } catch {
      toast.error(
        isEdit ? "Failed to update category" : "Failed to create category"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter out the current category from parent dropdown options (cannot be its own parent)
  const parentOptions = categories.filter(
    (cat) => cat.id !== initialData?.id
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 w-full max-w-3xl mx-auto pb-12"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEdit ? "Edit Category" : "Create New Category"}
        </h1>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded border border-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            {isEdit ? "Save Changes" : "Create Category"}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h2 className="font-semibold text-gray-900 mb-4">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Category Name
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
            placeholder="e.g. Electronics"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Slug
          </label>
          <input
            name="slug"
            value={formData.slug}
            onChange={handleSlugChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600 font-mono text-sm"
            placeholder="e.g. electronics"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Auto-generated from name. Edit to customize.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Parent Category
          </label>
          <select
            name="parentId"
            value={formData.parentId}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
          >
            <option value="">None (Top Level)</option>
            {parentOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Icon
            </label>
            <input
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
              placeholder="e.g. emoji or icon name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Image URL
            </label>
            <input
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h2 className="font-semibold text-gray-900 mb-4">Settings</h2>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Position
          </label>
          <input
            name="position"
            type="number"
            value={formData.position}
            onChange={handleChange}
            className="w-full max-w-[200px] px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
            min="0"
          />
          <p className="text-xs text-gray-400 mt-1">
            Lower numbers appear first in navigation.
          </p>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-sm font-medium text-gray-700">
              Show in Navigation
            </span>
            <p className="text-xs text-gray-400">
              Display this category in the site navigation bar.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, showInNav: !prev.showInNav }))
            }
            className={`w-12 h-6 rounded-full transition-colors relative ${
              formData.showInNav ? "bg-green-600" : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                formData.showInNav ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-t border-gray-100">
          <div>
            <span className="text-sm font-medium text-gray-700">Active</span>
            <p className="text-xs text-gray-400">
              Inactive categories are hidden from the storefront.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
            }
            className={`w-12 h-6 rounded-full transition-colors relative ${
              formData.isActive ? "bg-green-600" : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                formData.isActive ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>
    </form>
  );
}
