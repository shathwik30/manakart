"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { HomepageSection } from "@/lib/api";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { HomepageSectionForm } from "@/components/admin/HomepageSectionForm";

const SECTION_TYPE_LABELS: Record<string, string> = {
  deal_of_day: "Deal of the Day",
  category_grid: "Category Grid",
  product_carousel: "Product Carousel",
  banner: "Banner",
};

export default function AdminHomepage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getHomepageSections();
      setSections(data.sections);
    } catch {
      toast.error("Failed to load homepage sections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    try {
      await adminApi.deleteHomepageSection(id);
      toast.success("Section deleted");
      fetchSections();
    } catch {
      toast.error("Failed to delete section");
    }
  };

  const handleEdit = (section: HomepageSection) => {
    setEditingSection(section);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingSection(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSection(null);
    fetchSections();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSection(null);
  };

  if (showForm) {
    return (
      <HomepageSectionForm
        initialData={editingSection}
        isEdit={!!editingSection}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">Homepage Sections</h1>
          <p className="text-gray-500 text-sm">Manage homepage layout and sections</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={18} />
          <span>Add Section</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-green-600" size={30} />
          </div>
        ) : sections.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No homepage sections found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
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
                {sections.map((section) => (
                  <tr key={section.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {section.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {SECTION_TYPE_LABELS[section.type] || section.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {section.position}
                    </td>
                    <td className="px-6 py-4">
                      {section.isActive ? (
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
                        <button
                          onClick={() => handleEdit(section)}
                          className="p-2 text-gray-400 hover:text-green-600 rounded transition-colors"
                          title="Edit section"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(section.id)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded transition-colors"
                          title="Delete section"
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
