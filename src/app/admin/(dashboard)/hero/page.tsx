"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { HeroContent } from "@/lib/api";
import { HeroForm } from "@/components/admin/HeroForm";
import { Edit, Trash2, Loader2, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
export default function AdminMarketing() {
  const [heroContent, setHeroContent] = useState<HeroContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedHero, setSelectedHero] = useState<HeroContent | undefined>();
  const fetchHero = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getHeroContent();
      setHeroContent(data.heroContent);
    } catch {
      toast.error("Failed to load hero content");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchHero();
  }, []);
  const handleOpenForm = (hero?: HeroContent) => {
    setSelectedHero(hero);
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedHero(undefined);
  };
  const handleFormSuccess = () => {
    fetchHero();
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hero slide?")) return;
    try {
      await adminApi.deleteHeroContent(id);
      toast.success("Hero slide deleted");
      fetchHero();
    } catch {
      toast.error("Failed to delete hero slide");
    }
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-[#1A1A1A] mb-2">Hero Slides</h1>
          <p className="text-[#8C7B75] text-sm">Manage landing page hero carousel</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 bg-[#1A1A1A] text-[#FAF6F0] px-4 py-2 rounded hover:bg-[#2C2C2C] transition-colors"
        >
          <Plus size={18} />
          <span>Add Hero Slide</span>
        </button>
      </div>
      <div className="space-y-8">
        <section>
          {loading ? (
            <div className="flex justify-center py-12 bg-white rounded-lg border border-[#E0E0E0]">
              <Loader2 className="animate-spin text-[#C9A227]" size={24} />
            </div>
          ) : heroContent.length === 0 ? (
            <div className="bg-white p-12 rounded-lg border border-[#E0E0E0] text-center">
              <p className="text-[#888] mb-4">No hero slides configured.</p>
              <button
                onClick={() => handleOpenForm()}
                className="inline-flex items-center gap-2 bg-[#1A1A1A] text-[#FAF6F0] px-4 py-2 rounded hover:bg-[#2C2C2C] transition-colors"
              >
                <Plus size={18} />
                <span>Add Your First Slide</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {heroContent.map((hero) => (
                <div
                  key={hero.id}
                  className="bg-white p-6 rounded-lg shadow-sm border border-[#E0E0E0] flex gap-6 group hover:shadow-md transition-shadow"
                >
                  <div className="w-64 aspect-video bg-[#F5F5F5] relative rounded overflow-hidden flex-shrink-0">
                    <img
                      src={hero.image}
                      alt={hero.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    {!hero.isActive && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
                        Inactive
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[#8C7B75] uppercase tracking-wider mb-1">
                        Title
                      </label>
                      <div className="text-[#1A1A1A] font-serif text-xl">
                        {hero.title}
                      </div>
                    </div>
                    {hero.subtitle && (
                      <div>
                        <label className="block text-xs font-medium text-[#8C7B75] uppercase tracking-wider mb-1">
                          Subtitle
                        </label>
                        <div className="text-[#555]">{hero.subtitle}</div>
                      </div>
                    )}
                    {(hero.ctaText || hero.ctaLink) && (
                      <div className="flex gap-4">
                        {hero.ctaText && (
                          <div>
                            <label className="block text-xs font-medium text-[#8C7B75] uppercase tracking-wider mb-1">
                              CTA Text
                            </label>
                            <div className="text-sm border border-[#E0E0E0] px-3 py-1 rounded bg-[#FAFAFA]">
                              {hero.ctaText}
                            </div>
                          </div>
                        )}
                        {hero.ctaLink && (
                          <div>
                            <label className="block text-xs font-medium text-[#8C7B75] uppercase tracking-wider mb-1">
                              CTA Link
                            </label>
                            <div className="text-sm border border-[#E0E0E0] px-3 py-1 rounded bg-[#FAFAFA]">
                              {hero.ctaLink}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleOpenForm(hero)}
                      className="p-2 text-[#AAA] hover:text-[#C9A227] hover:bg-[#FAF6F0] rounded transition-colors"
                      title="Edit slide"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(hero.id)}
                      className="p-2 text-[#AAA] hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Delete slide"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      {showForm && (
        <HeroForm
          hero={selectedHero}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
