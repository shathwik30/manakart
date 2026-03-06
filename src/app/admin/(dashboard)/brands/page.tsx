"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { Brand } from "@/lib/api";
import { Plus, Trash2, Loader2, Pencil, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { slugify } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

interface BrandFormData {
  name: string;
  slug: string;
  logo: string;
  isActive: boolean;
}

const emptyForm: BrandFormData = {
  name: "",
  slug: "",
  logo: "",
  isActive: true,
};

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<BrandFormData>(emptyForm);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getBrands();
      setBrands(data.brands);
    } catch {
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openCreateModal = () => {
    setEditingBrand(null);
    setFormData(emptyForm);
    setSlugManuallyEdited(false);
    setIsModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo || "",
      isActive: brand.isActive,
    });
    setSlugManuallyEdited(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setFormData(emptyForm);
    setSlugManuallyEdited(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
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
      toast.error("Brand name is required");
      return;
    }

    if (!formData.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        logo: formData.logo.trim() || null,
        isActive: formData.isActive,
      };

      if (editingBrand) {
        await adminApi.updateBrand(editingBrand.id, payload);
        toast.success("Brand updated successfully");
      } else {
        await adminApi.createBrand(payload);
        toast.success("Brand created successfully");
      }

      closeModal();
      fetchBrands();
    } catch {
      toast.error(
        editingBrand ? "Failed to update brand" : "Failed to create brand"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    try {
      await adminApi.deleteBrand(id);
      toast.success("Brand deleted successfully");
      fetchBrands();
    } catch {
      toast.error("Failed to delete brand");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Brands</h1>
          <p className="text-gray-500 text-sm">Manage your product brands</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={18} />
          <span>Add Brand</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-medium">
              <tr>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Slug</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Loading brands...</span>
                    </div>
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No brands found.
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {brand.logo && (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-8 h-8 object-contain rounded"
                          />
                        )}
                        <span className="font-medium text-gray-900">
                          {brand.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {brand.slug}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          brand.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {brand.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(brand)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id)}
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
      </div>

      {/* Create/Edit Brand Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBrand ? "Edit Brand" : "Add Brand"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Brand Name
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
              placeholder="e.g. Nike"
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
              placeholder="e.g. nike"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Auto-generated from name. Edit to customize.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Logo URL
            </label>
            <input
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-gray-700">Active</span>
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

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded border border-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="animate-spin" size={16} />}
              {editingBrand ? "Save Changes" : "Create Brand"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
