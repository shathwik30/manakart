"use client";

import { useState, useEffect } from "react";
import { OutfitDetail, Product } from "@/lib/api";
import { adminApi } from "@/lib/adminApi";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Loader2, X, Plus, Search, Check } from "lucide-react";
import Image from "next/image";

interface OutfitFormProps {
  initialData?: OutfitDetail;
}

export default function OutfitForm({ initialData }: OutfitFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [showProductSearch, setShowProductSearch] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    genderType: initialData?.genderType || "GENTLEMEN" as "GENTLEMEN" | "LADY" | "COUPLE",
    description: initialData?.description || "",
    bundlePrice: initialData?.bundlePrice ? initialData.bundlePrice / 100 : 0,
    isActive: initialData?.isActive ?? true,
    isFeatured: initialData?.isFeatured ?? false,
  });

  const [heroImages, setHeroImages] = useState<string[]>(initialData?.heroImages || []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(initialData?.products || []);
  const [productSearch, setProductSearch] = useState("");

  
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setSearchingProducts(true);
      const data = await adminApi.getProducts({ page: 1, limit: 100 });
      setAvailableProducts(data.products);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setSearchingProducts(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? parseFloat(value) : value,
      }));
    }
  };

  const addHeroImage = () => {
    if (!newImageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }
    if (!newImageUrl.startsWith("http")) {
      toast.error("Please enter a valid URL starting with http or https");
      return;
    }
    setHeroImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const removeHeroImage = (index: number) => {
    setHeroImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleProductSelection = (product: Product) => {
    setSelectedProducts((prev) => {
      const isSelected = prev.some((p) => p.id === product.id);
      if (isSelected) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const filteredProducts = availableProducts.filter((product) =>
    product.title.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      
      if (!formData.title.trim()) {
        toast.error("Title is required");
        setLoading(false);
        return;
      }

      if (heroImages.length === 0) {
        toast.error("At least one hero image is required");
        setLoading(false);
        return;
      }

      if (selectedProducts.length === 0) {
        toast.error("Please select at least one product");
        setLoading(false);
        return;
      }

      if (formData.bundlePrice <= 0) {
        toast.error("Bundle price must be greater than 0");
        setLoading(false);
        return;
      }

      const payload = {
        title: formData.title,
        genderType: formData.genderType,
        description: formData.description || undefined,
        bundlePrice: Math.round(formData.bundlePrice * 100), 
        heroImages,
        productIds: selectedProducts.map((p) => p.id),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
      };

      await adminApi.createOutfit(payload);
      toast.success("Outfit created successfully");

      router.push("/admin/outfits");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save outfit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Basic Information</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-600 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-gold-600 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-600 mb-1">
              Gender Type <span className="text-red-500">*</span>
            </label>
            <select
              name="genderType"
              value={formData.genderType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-gold-600 focus:border-transparent"
              required
            >
              <option value="GENTLEMEN">Gentlemen</option>
              <option value="LADY">Lady</option>
              <option value="COUPLE">Couple</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-600 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-gold-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-600 mb-1">
              Bundle Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="bundlePrice"
              value={formData.bundlePrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-gold-600 focus:border-transparent"
              required
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-gold-600 border-charcoal-300 rounded focus:ring-gold-600"
              />
              <span className="text-sm font-medium text-charcoal-600">Active</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 text-gold-600 border-charcoal-300 rounded focus:ring-gold-600"
              />
              <span className="text-sm font-medium text-charcoal-600">Featured</span>
            </label>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Hero Images</h2>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Enter image URL (https://...)"
              className="flex-1 px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-gold-600 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addHeroImage}
              className="px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {heroImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {heroImages.map((url, index) => (
                <div key={index} className="relative aspect-[3/4] rounded-lg overflow-hidden bg-cream-200">
                  <Image
                    src={url}
                    alt={`Hero ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeHeroImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {heroImages.length === 0 && (
            <p className="text-sm text-charcoal-500">No hero images added yet</p>
          )}
        </div>
      </div>

      {}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#1A1A1A]">
            Products ({selectedProducts.length} selected)
          </h2>
          <button
            type="button"
            onClick={() => setShowProductSearch(!showProductSearch)}
            className="px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {showProductSearch ? "Hide Search" : "Add Products"}
          </button>
        </div>

        {}
        {selectedProducts.length > 0 && (
          <div className="mb-4 space-y-2">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-cream-100 rounded-lg"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-cream-200">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-charcoal-300 text-xs">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-charcoal-900">{product.title}</h4>
                  <p className="text-sm text-charcoal-500 capitalize">{product.category}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {}
        {showProductSearch && (
          <div className="space-y-4">
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-gold-600 focus:border-transparent"
            />

            {searchingProducts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gold-600" />
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProducts.some((p) => p.id === product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleProductSelection(product)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isSelected
                          ? "bg-gold-100 border-2 border-gold-600"
                          : "bg-white border-2 border-charcoal-200 hover:border-gold-400"
                      }`}
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-cream-200">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-charcoal-300 text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-medium text-charcoal-900">{product.title}</h4>
                        <p className="text-sm text-charcoal-500 capitalize">{product.category}</p>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-gold-600" />
                      )}
                    </button>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <p className="text-center text-charcoal-500 py-8">No products found</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push("/admin/outfits")}
          className="px-6 py-2 border border-charcoal-300 text-charcoal-700 rounded-lg hover:bg-charcoal-50 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Outfit
        </button>
      </div>
    </form>
  );
}
