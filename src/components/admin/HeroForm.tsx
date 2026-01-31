"use client";
import { useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { HeroContent } from "@/lib/api";
import { Button } from "@/components/ui";
import toast from "react-hot-toast";
import { X } from "lucide-react";
interface HeroFormProps {
  hero?: HeroContent;
  onClose: () => void;
  onSuccess: () => void;
}
export function HeroForm({ hero, onClose, onSuccess }: HeroFormProps) {
  const [formData, setFormData] = useState({
    title: hero?.title || "",
    subtitle: hero?.subtitle || "",
    image: hero?.image || "",
    ctaText: hero?.ctaText || "",
    ctaLink: hero?.ctaLink || "",
    isActive: hero?.isActive !== undefined ? hero.isActive : true,
  });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.image.trim()) {
      toast.error("Image URL is required");
      return;
    }
    try {
      setLoading(true);
      if (hero) {
        await adminApi.updateHeroContent(hero.id, {
          title: formData.title,
          subtitle: formData.subtitle || undefined,
          image: formData.image,
          ctaText: formData.ctaText || undefined,
          ctaLink: formData.ctaLink || undefined,
          isActive: formData.isActive,
        });
        toast.success("Hero slide updated");
      } else {
        await adminApi.createHeroContent({
          title: formData.title,
          subtitle: formData.subtitle || undefined,
          image: formData.image,
          ctaText: formData.ctaText || undefined,
          ctaLink: formData.ctaLink || undefined,
          isActive: formData.isActive,
        });
        toast.success("Hero slide created");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save hero slide");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-charcoal-100 bg-white">
          <h2 className="text-xl font-serif text-charcoal-900">
            {hero ? "Edit Hero Slide" : "Add Hero Slide"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-cream-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-charcoal-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Preview */}
          {formData.image && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-cream-200">
              <img
                src={formData.image}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/1920x1080/e5e7eb/1f2937?text=Image+Not+Found";
                }}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-charcoal-900 mb-2">
              Image URL *
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-charcoal-200 rounded-lg focus:outline-none focus:border-gold-500"
              required
            />
            <p className="text-xs text-charcoal-500 mt-1">
              Use high-resolution images (recommended: 1920x1080px or larger)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-900 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Timeless Elegance"
              className="w-full px-4 py-2 border border-charcoal-200 rounded-lg focus:outline-none focus:border-gold-500"
              required
            />
            <p className="text-xs text-charcoal-500 mt-1">
              Main headline displayed on the hero slide
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-900 mb-2">
              Subtitle
            </label>
            <textarea
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
              placeholder="Discover our new collection of refined classics"
              rows={3}
              className="w-full px-4 py-2 border border-charcoal-200 rounded-lg focus:outline-none focus:border-gold-500 resize-none"
            />
            <p className="text-xs text-charcoal-500 mt-1">
              Optional description text below the title
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-900 mb-2">
                CTA Button Text
              </label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) =>
                  setFormData({ ...formData, ctaText: e.target.value })
                }
                placeholder="Shop Now"
                className="w-full px-4 py-2 border border-charcoal-200 rounded-lg focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-900 mb-2">
                CTA Button Link
              </label>
              <input
                type="text"
                value={formData.ctaLink}
                onChange={(e) =>
                  setFormData({ ...formData, ctaLink: e.target.value })
                }
                placeholder="/collections"
                className="w-full px-4 py-2 border border-charcoal-200 rounded-lg focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4 text-gold-500 rounded"
            />
            <label htmlFor="isActive" className="text-sm text-charcoal-900">
              Active (visible on website)
            </label>
          </div>
          <div className="flex gap-3 pt-4 border-t border-charcoal-100">
            <Button
              variant="secondary"
              fullWidth
              onClick={onClose}
              disabled={loading}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              type="submit"
              isLoading={loading}
            >
              {hero ? "Update Slide" : "Create Slide"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
