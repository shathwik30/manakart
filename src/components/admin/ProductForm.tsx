"use client";

import { useState } from "react";
import { Product } from "@/lib/api";
import { adminApi } from "@/lib/adminApi";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Loader2, X, Plus, Link as LinkIcon } from "lucide-react";
import Image from "next/image";

interface ProductFormProps {
  initialData?: Product;
  isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Capitalize first letter for category to match select options
  const capitalizeCategory = (cat: string) => {
    if (!cat) return "";
    return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
  };

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    category: initialData?.category ? capitalizeCategory(initialData.category) : "",
    description: initialData?.description || "",
    basePrice: initialData?.basePrice ? initialData.basePrice / 100 : 0,
    isActive: initialData?.isActive ?? true,
    availableSizes: initialData?.availableSizes || [],
    stockPerSize: initialData?.stockPerSize || {},
  });

  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newSize, setNewSize] = useState("");
  const [sizeType, setSizeType] = useState<"clothing" | "numeric" | "onesize" | "custom">(
    initialData?.availableSizes?.length
      ? (initialData.availableSizes.includes("ONE SIZE") ? "onesize" :
         initialData.availableSizes.every((s: string) => /^\d+$/.test(s)) ? "numeric" :
         initialData.availableSizes.every((s: string) => /^[SMLX]+$/.test(s)) ? "clothing" : "custom")
      : "clothing"
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleStockChange = (size: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      stockPerSize: {
        ...prev.stockPerSize,
        [size]: parseInt(value) || 0,
      },
    }));
  };

  const handleSizeTypeChange = (type: "clothing" | "numeric" | "onesize" | "custom") => {
    setSizeType(type);

    let newSizes: string[] = [];
    let newStock: Record<string, number> = {};

    if (type === "clothing") {
      newSizes = ["S", "M", "L", "XL"];
      newSizes.forEach(size => { newStock[size] = 10; });
    } else if (type === "numeric") {
      newSizes = ["28", "30", "32", "34", "36"];
      newSizes.forEach(size => { newStock[size] = 10; });
    } else if (type === "onesize") {
      newSizes = ["ONE SIZE"];
      newStock["ONE SIZE"] = 50;
    }
    // custom type starts empty

    setFormData(prev => ({
      ...prev,
      availableSizes: newSizes,
      stockPerSize: newStock,
    }));
  };

  const addCustomSize = () => {
    const size = newSize.trim().toUpperCase();

    if (!size) {
      toast.error("Please enter a size");
      return;
    }

    if (formData.availableSizes.includes(size)) {
      toast.error("Size already exists");
      return;
    }

    setFormData(prev => ({
      ...prev,
      availableSizes: [...prev.availableSizes, size],
      stockPerSize: { ...prev.stockPerSize, [size]: 10 },
    }));
    setNewSize("");
    toast.success(`Size ${size} added`);
  };

  const removeSize = (size: string) => {
    setFormData(prev => {
      const newStock = { ...prev.stockPerSize };
      delete newStock[size];

      return {
        ...prev,
        availableSizes: prev.availableSizes.filter(s => s !== size),
        stockPerSize: newStock,
      };
    });
  };

  const addImageUrl = () => {
    const url = newImageUrl.trim();

    // Basic URL validation
    if (!url) {
      toast.error("Please enter an image URL");
      return;
    }

    if (!url.match(/^https?:\/\/.+/i)) {
      toast.error("Please enter a valid URL (starting with http:// or https://)");
      return;
    }

    setImages((prev) => [...prev, url]);
    setNewImageUrl("");
    toast.success("Image URL added");
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (images.length === 0) {
      toast.error("Please add at least one image URL");
      return;
    }

    if (formData.availableSizes.length === 0) {
      toast.error("Please add at least one size option");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        basePrice: formData.basePrice * 100, // Convert to paise
        isActive: formData.isActive,
        stockPerSize: formData.stockPerSize,
        availableSizes: formData.availableSizes,
        images: images, // Array of URL strings
      };

      if (isEdit && initialData) {
        await adminApi.updateProduct(initialData.id, payload);
        toast.success("Product updated successfully");
      } else {
        await adminApi.createProduct(payload);
        toast.success("Product created successfully");
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error(isEdit ? "Failed to update product" : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-serif text-charcoal-900">
          {isEdit ? "Edit Product" : "Create New Product"}
        </h1>
        <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm text-charcoal-600 hover:bg-cream-50 rounded border border-charcoal-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm bg-charcoal-900 text-cream-100 rounded hover:bg-charcoal-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              {isEdit ? "Save Changes" : "Create Product"}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-charcoal-200 space-y-4">
            <h2 className="font-medium text-charcoal-900 mb-4">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1">Product Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-cream-50 border border-charcoal-200 rounded focus:outline-none focus:border-gold-500"
                placeholder="e.g. Italian Wool Suit"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-charcoal-600 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-cream-50 border border-charcoal-200 rounded focus:outline-none focus:border-gold-500"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Suits">Suits</option>
                    <option value="Blazers">Blazers</option>
                    <option value="Trousers">Trousers</option>
                    <option value="Shirts">Shirts</option>
                    <option value="Dresses">Dresses</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Accessories">Accessories</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-charcoal-600 mb-1">Base Price (₹)</label>
                  <input
                    name="basePrice"
                    type="number"
                    value={formData.basePrice}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-cream-50 border border-charcoal-200 rounded focus:outline-none focus:border-gold-500"
                    min="0"
                    required
                  />
               </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 bg-cream-50 border border-charcoal-200 rounded focus:outline-none focus:border-gold-500"
                placeholder="Detailed product description..."
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-charcoal-200 space-y-4">
              <h2 className="font-medium text-charcoal-900 mb-4">Inventory & Sizes</h2>

              {}
              <div>
                <label className="block text-sm font-medium text-charcoal-600 mb-2">Size Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSizeTypeChange("clothing")}
                    className={`px-3 py-2 text-sm rounded border transition-colors ${
                      sizeType === "clothing"
                        ? "bg-gold-500 text-white border-gold-500"
                        : "bg-cream-50 text-charcoal-600 border-charcoal-200 hover:border-gold-500"
                    }`}
                  >
                    S/M/L/XL
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSizeTypeChange("numeric")}
                    className={`px-3 py-2 text-sm rounded border transition-colors ${
                      sizeType === "numeric"
                        ? "bg-gold-500 text-white border-gold-500"
                        : "bg-cream-50 text-charcoal-600 border-charcoal-200 hover:border-gold-500"
                    }`}
                  >
                    Numeric (28-36)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSizeTypeChange("onesize")}
                    className={`px-3 py-2 text-sm rounded border transition-colors ${
                      sizeType === "onesize"
                        ? "bg-gold-500 text-white border-gold-500"
                        : "bg-cream-50 text-charcoal-600 border-charcoal-200 hover:border-gold-500"
                    }`}
                  >
                    One Size
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSizeTypeChange("custom")}
                    className={`px-3 py-2 text-sm rounded border transition-colors ${
                      sizeType === "custom"
                        ? "bg-gold-500 text-white border-gold-500"
                        : "bg-cream-50 text-charcoal-600 border-charcoal-200 hover:border-gold-500"
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {}
              {sizeType === "custom" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal-600">Add Custom Size</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomSize();
                        }
                      }}
                      placeholder="e.g. 30, XS, etc."
                      className="flex-1 px-3 py-2 text-sm bg-cream-50 border border-charcoal-200 rounded focus:outline-none focus:border-gold-500"
                    />
                    <button
                      type="button"
                      onClick={addCustomSize}
                      className="px-4 py-2 bg-gold-500 text-white rounded hover:bg-gold-600 transition-colors flex items-center gap-1 text-sm"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </div>
              )}

              {}
              {formData.availableSizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-charcoal-600 mb-2">Stock per Size</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {formData.availableSizes.map((size) => (
                      <div key={size} className="relative">
                        <label className="block text-xs font-medium text-charcoal-500 mb-1 text-center">{size}</label>
                        <input
                          type="number"
                          value={formData.stockPerSize[size] || 0}
                          onChange={(e) => handleStockChange(size, e.target.value)}
                          className="w-full px-2 py-1 text-center bg-cream-50 border border-charcoal-200 rounded focus:outline-none focus:border-gold-500"
                          min="0"
                        />
                        {sizeType === "custom" && (
                          <button
                            type="button"
                            onClick={() => removeSize(size)}
                            className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>

        {}
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
           {}
           <div className="bg-white p-6 rounded-lg shadow-sm border border-charcoal-200 space-y-4">
              <h2 className="font-medium text-charcoal-900 mb-2">Status</h2>
              <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal-600">Active</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${formData.isActive ? 'bg-gold-500' : 'bg-gray-300'}`}
                  >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isActive ? 'left-7' : 'left-1'}`} />
                  </button>
              </div>
           </div>

           {}
           <div className="bg-white p-6 rounded-lg shadow-sm border border-charcoal-200 space-y-4">
              <h2 className="font-medium text-charcoal-900">Product Images</h2>

              {}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-charcoal-600">Add Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addImageUrl();
                      }
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 text-sm bg-cream-50 border border-charcoal-200 rounded focus:outline-none focus:border-gold-500"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-4 py-2 bg-gold-500 text-white rounded hover:bg-gold-600 transition-colors flex items-center gap-1 text-sm"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
                <p className="text-xs text-charcoal-500">
                  <LinkIcon className="inline w-3 h-3 mr-1" />
                  Paste image URL from CDN (Cloudinary, ImageKit, etc.)
                </p>
              </div>

              {}
              {images.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal-600">
                    Image Previews ({images.length})
                  </label>
                  <div className="max-h-[600px] overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-2">
                      {images.map((img, idx) => (
                        <div key={idx} className="aspect-[3/4] relative rounded overflow-hidden group border border-charcoal-200">
                          <Image
                            src={img}
                            alt={`Product ${idx + 1}`}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EError%3C/text%3E%3C/svg%3E";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X size={14} />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="truncate">{img}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </form>
  );
}
