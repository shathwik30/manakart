"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { HomepageSection } from "@/lib/api";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

const SECTION_TYPES = [
  { value: "deal_of_day", label: "Deal of the Day" },
  { value: "category_grid", label: "Category Grid" },
  { value: "product_carousel", label: "Product Carousel" },
  { value: "banner", label: "Banner" },
];

interface HomepageSectionFormProps {
  initialData?: HomepageSection | null;
  isEdit?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function HomepageSectionForm({
  initialData,
  isEdit,
  onSuccess,
  onCancel,
}: HomepageSectionFormProps) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "deal_of_day",
    config: "",
    position: "0",
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        type: initialData.type,
        config: initialData.config ? JSON.stringify(initialData.config, null, 2) : "",
        position: String(initialData.position),
        isActive: initialData.isActive,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    let parsedConfig: Record<string, unknown> | null = null;
    if (formData.config.trim()) {
      try {
        parsedConfig = JSON.parse(formData.config);
      } catch {
        toast.error("Config must be valid JSON");
        return;
      }
    }

    setLoading(true);
    try {
      const payload: Partial<HomepageSection> = {
        title: formData.title,
        type: formData.type,
        config: parsedConfig,
        position: Number(formData.position),
        isActive: formData.isActive,
      };

      if (isEdit && initialData) {
        await adminApi.updateHomepageSection(initialData.id, payload);
        toast.success("Section updated");
      } else {
        await adminApi.createHomepageSection(payload);
        toast.success("Section created");
      }
      onSuccess();
    } catch (error) {
      toast.error(isEdit ? "Failed to update section" : "Failed to create section");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Homepage Sections
        </button>
        <h1 className="text-3xl font-semibold text-gray-900">
          {isEdit ? "Edit Section" : "Create Section"}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Today's Best Deals"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Type *
              </label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                {SECTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
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
                Lower numbers appear first on the homepage.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Config (JSON)
            </label>
            <textarea
              rows={6}
              placeholder='e.g. { "limit": 8, "showTimer": true }'
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 font-mono text-sm resize-y"
              value={formData.config}
              onChange={(e) =>
                setFormData({ ...formData, config: e.target.value })
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional JSON configuration for this section.
            </p>
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
              {isEdit ? "Update Section" : "Create Section"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
