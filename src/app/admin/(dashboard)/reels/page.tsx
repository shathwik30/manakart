"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { Reel, Outfit } from "@/lib/api";
import { ReelForm } from "@/components/admin/ReelForm";
import { Plus, Trash2, Video, Loader2, Edit } from "lucide-react";
import { toast } from "react-hot-toast";
export default function AdminReels() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedReel, setSelectedReel] = useState<Reel | undefined>();
  const fetchReels = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getReels();
      setReels(data.reels);
    } catch {
      toast.error("Failed to load reels");
    } finally {
      setLoading(false);
    }
  };
  const fetchOutfits = async () => {
    try {
      const data = await adminApi.getOutfits();
      setOutfits(data.outfits);
    } catch {
      console.error("Failed to load outfits");
    }
  };
  useEffect(() => {
    fetchReels();
    fetchOutfits();
  }, []);
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reel?")) return;
    try {
      await adminApi.deleteReel(id);
      toast.success("Reel deleted");
      fetchReels();
    } catch {
      toast.error("Failed to delete reel");
    }
  };
  const handleOpenForm = (reel?: Reel) => {
    setSelectedReel(reel);
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedReel(undefined);
  };
  const handleFormSuccess = () => {
    fetchReels();
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-[#1A1A1A] mb-2">Reels</h1>
          <p className="text-[#8C7B75] text-sm">Manage video content</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 bg-[#1A1A1A] text-[#FAF6F0] px-4 py-2 rounded hover:bg-[#2C2C2C] transition-colors"
        >
          <Plus size={18} />
          <span>Add Reel</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="animate-spin text-[#C9A227]" size={30} />
          </div>
        ) : reels.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-[#E0E0E0] rounded-lg">
            <p className="text-[#888]">No reels found.</p>
          </div>
        ) : (
          reels.map((reel) => (
            <div
              key={reel.id}
              className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden group"
            >
              <div className="aspect-[9/16] relative bg-black">
                <div className="absolute inset-0 flex items-center justify-center text-white/50">
                  <Video size={32} />
                </div>
                {reel.thumbnail && (
                  <img
                    src={reel.thumbnail}
                    alt="Reel thumbnail"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleOpenForm(reel)}
                    className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-gold-500 transition-colors"
                    title="Edit reel"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(reel.id)}
                    className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-red-500 transition-colors"
                    title="Delete reel"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                {reel.title ? (
                  <h3 className="font-medium text-[#1A1A1A] mb-1 truncate">
                    {reel.title}
                  </h3>
                ) : (
                  <p className="text-sm text-[#888] italic">Untitled Reel</p>
                )}
                {reel.outfit && (
                  <div className="flex items-center gap-1 text-xs text-[#C9A227] mt-2">
                    <span className="truncate">Linked to {reel.outfit.title}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {showForm && (
        <ReelForm
          reel={selectedReel}
          outfits={outfits}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
