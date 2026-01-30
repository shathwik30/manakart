"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { Reel, Outfit } from "@/lib/api";
import { Button } from "@/components/ui";
import toast from "react-hot-toast";
import { X } from "lucide-react";

interface ReelFormProps {
  reel?: Reel;
  onClose: () => void;
  onSuccess: () => void;
  outfits: Outfit[];
}

export function ReelForm({ reel, onClose, onSuccess, outfits }: ReelFormProps) {
  const [formData, setFormData] = useState({
    videoUrl: reel?.videoUrl || "",
    thumbnail: reel?.thumbnail || "",
    title: reel?.title || "",
    outfitId: reel?.outfit?.id || "",
    isActive: reel ? true : true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.videoUrl.trim()) {
      toast.error("Video URL is required");
      return;
    }

    try {
      setLoading(true);

      if (reel) {
        await adminApi.updateReel(reel.id, {
          videoUrl: formData.videoUrl,
          thumbnail: formData.thumbnail,
          title: formData.title,
          outfitId: formData.outfitId || undefined,
          isActive: formData.isActive,
        });
        toast.success("Reel updated");
      } else {
        await adminApi.createReel({
          videoUrl: formData.videoUrl,
          thumbnail: formData.thumbnail,
          title: formData.title,
          outfitId: formData.outfitId || undefined,
          isActive: formData.isActive,
        });
        toast.success("Reel created");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save reel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-charcoal-100 bg-white">
          <h2 className="text-xl font-serif text-charcoal-900">
            {reel ? "Edit Reel" : "Add Reel"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-cream-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-charcoal-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-900 mb-2">
              Video URL *
            </label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) =>
                setFormData({ ...formData, videoUrl: e.target.value })
              }
              placeholder="https://example.com/video.mp4"
              className="w-full px-4 py-2 border border-charcoal-200 rounded-lg focus:outline-none focus:border-gold-500"
              required
            />
            <p className="text-xs text-charcoal-500 mt-1">
              Direct link to video file (MP4, WebM, etc.)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-900 mb-2">
              Thumbnail URL
            </label>
            <input
              type="url"
              value={formData.thumbnail}
              onChange={(e) =>
                setFormData({ ...formData, thumbnail: e.target.value })
              }
              placeholder="https://example.com/thumbnail.jpg"
              className="w-full px-4 py-2 border border-charcoal-200 rounded-lg focus:outline-none focus:border-gold-500"
            />
            <p className="text-xs text-charcoal-500 mt-1">
              Optional: Cover image for the reel
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-900 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Reel title"
              className="w-full px-4 py-2 border border-charcoal-200 rounded-lg focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-900 mb-2">
              Link to Outfit
            </label>
            <select
              value={formData.outfitId}
              onChange={(e) =>
                setFormData({ ...formData, outfitId: e.target.value })
              }
              className="w-full px-4 py-2 border border-charcoal-200 rounded-lg focus:outline-none focus:border-gold-500"
            >
              <option value="">None</option>
              {outfits.map((outfit) => (
                <option key={outfit.id} value={outfit.id}>
                  {outfit.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-charcoal-500 mt-1">
              Optional: Outfit to link with this reel
            </p>
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
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              type="submit"
              isLoading={loading}
            >
              {reel ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
