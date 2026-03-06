"use client";
import { useState, useEffect } from "react";
import { Product, ProductOption, ProductVariant } from "@/lib/api";
import { adminApi } from "@/lib/adminApi";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Loader2, X, Plus, Link as LinkIcon, Trash2, AlertTriangle } from "lucide-react";
import Image from "next/image";

interface ProductFormProps {
  initialData?: Product;
  isEdit?: boolean;
}

interface SpecItem {
  key: string;
  value: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface BrandOption {
  id: string;
  name: string;
}

interface OptionDraft {
  name: string;
  values: string[];
}

interface VariantDraft {
  optionValues: { optionName: string; valueName: string }[];
  price: number;
  comparePrice: number;
  stock: number;
  sku: string;
  isActive: boolean;
}

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [brands, setBrands] = useState<BrandOption[]>([]);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    categoryId: initialData?.categoryId || "",
    brandId: initialData?.brandId || "",
    description: initialData?.description || "",
    basePrice: initialData?.basePrice ? initialData.basePrice / 100 : 0,
    comparePrice: initialData?.comparePrice ? initialData.comparePrice / 100 : 0,
    stock: initialData?.stock ?? 0,
    sku: initialData?.sku || "",
    isActive: initialData?.isActive ?? true,
    isFeatured: initialData?.isFeatured ?? false,
  });

  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [specifications, setSpecifications] = useState<SpecItem[]>(
    (initialData?.specifications as SpecItem[]) || [{ key: "", value: "" }]
  );

  // Variant state
  const [hasVariants, setHasVariants] = useState(initialData?.hasVariants ?? false);
  const [optionDrafts, setOptionDrafts] = useState<OptionDraft[]>(() => {
    if (initialData?.options && initialData.options.length > 0) {
      return initialData.options.map((opt) => ({
        name: opt.name,
        values: opt.values.map((v) => v.value),
      }));
    }
    return [];
  });
  const [variantDrafts, setVariantDrafts] = useState<VariantDraft[]>(() => {
    if (initialData?.variants && initialData.variants.length > 0) {
      return initialData.variants.map((v) => ({
        optionValues: v.optionValues,
        price: v.price / 100,
        comparePrice: v.comparePrice ? v.comparePrice / 100 : 0,
        stock: v.stock,
        sku: v.sku || "",
        isActive: v.isActive,
      }));
    }
    return [];
  });
  const [newOptionValueInput, setNewOptionValueInput] = useState<Record<number, string>>({});
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catData, brandData] = await Promise.all([
          adminApi.getCategories(),
          adminApi.getBrands(),
        ]);
        setCategories(catData.categories || []);
        setBrands(brandData.brands || []);
      } catch {
        // silent
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const addImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) {
      toast.error("Please enter an image URL");
      return;
    }
    if (!url.match(/^https?:\/\/.+/i)) {
      toast.error("Please enter a valid URL");
      return;
    }
    setImages((prev) => [...prev, url]);
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addSpec = () => {
    setSpecifications((prev) => [...prev, { key: "", value: "" }]);
  };

  const updateSpec = (index: number, field: "key" | "value", val: string) => {
    setSpecifications((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: val } : s))
    );
  };

  const removeSpec = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Variant helpers ───

  const addOption = () => {
    setOptionDrafts((prev) => [...prev, { name: "", values: [] }]);
  };

  const removeOption = (index: number) => {
    setOptionDrafts((prev) => prev.filter((_, i) => i !== index));
    setVariantDrafts([]);
  };

  const updateOptionName = (index: number, name: string) => {
    setOptionDrafts((prev) =>
      prev.map((o, i) => (i === index ? { ...o, name } : o))
    );
  };

  const addOptionValue = (optIndex: number) => {
    const val = (newOptionValueInput[optIndex] || "").trim();
    if (!val) return;
    setOptionDrafts((prev) =>
      prev.map((o, i) =>
        i === optIndex && !o.values.includes(val)
          ? { ...o, values: [...o.values, val] }
          : o
      )
    );
    setNewOptionValueInput((prev) => ({ ...prev, [optIndex]: "" }));
  };

  const removeOptionValue = (optIndex: number, valIndex: number) => {
    setOptionDrafts((prev) =>
      prev.map((o, i) =>
        i === optIndex ? { ...o, values: o.values.filter((_, vi) => vi !== valIndex) } : o
      )
    );
    setVariantDrafts([]);
  };

  const generateVariants = () => {
    const validOptions = optionDrafts.filter((o) => o.name.trim() && o.values.length > 0);
    if (validOptions.length === 0) {
      toast.error("Add at least one option with values");
      return;
    }

    // Cartesian product
    const combinations: { optionName: string; valueName: string }[][] = validOptions.reduce<
      { optionName: string; valueName: string }[][]
    >(
      (acc, opt) => {
        if (acc.length === 0) {
          return opt.values.map((v) => [{ optionName: opt.name, valueName: v }]);
        }
        const result: { optionName: string; valueName: string }[][] = [];
        for (const existing of acc) {
          for (const v of opt.values) {
            result.push([...existing, { optionName: opt.name, valueName: v }]);
          }
        }
        return result;
      },
      []
    );

    if (combinations.length > 100) {
      toast.error(`Too many variants (${combinations.length}). Max 100 combinations.`);
      return;
    }

    // Preserve existing variant data where option values match
    const newVariants: VariantDraft[] = combinations.map((combo) => {
      const existingMatch = variantDrafts.find((vd) =>
        vd.optionValues.length === combo.length &&
        vd.optionValues.every((ov) =>
          combo.some((c) => c.optionName === ov.optionName && c.valueName === ov.valueName)
        )
      );
      if (existingMatch) {
        return { ...existingMatch, optionValues: combo };
      }
      return {
        optionValues: combo,
        price: formData.basePrice || 0,
        comparePrice: formData.comparePrice || 0,
        stock: 0,
        sku: "",
        isActive: true,
      };
    });

    setVariantDrafts(newVariants);
    toast.success(`Generated ${newVariants.length} variants`);
  };

  const updateVariant = (index: number, field: keyof VariantDraft, value: any) => {
    setVariantDrafts((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const applyBulkPrice = () => {
    const price = parseFloat(bulkPrice);
    if (!price || price <= 0) return;
    setVariantDrafts((prev) => prev.map((v) => ({ ...v, price })));
    setBulkPrice("");
    toast.success("Applied price to all variants");
  };

  const applyBulkStock = () => {
    const stock = parseInt(bulkStock);
    if (isNaN(stock) || stock < 0) return;
    setVariantDrafts((prev) => prev.map((v) => ({ ...v, stock })));
    setBulkStock("");
    toast.success("Applied stock to all variants");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    if (hasVariants && variantDrafts.length === 0) {
      toast.error("Generate variants before saving");
      return;
    }

    if (hasVariants) {
      const invalidVariants = variantDrafts.filter((v) => v.isActive && v.price <= 0);
      if (invalidVariants.length > 0) {
        toast.error("All active variants must have a valid price");
        return;
      }
    }

    setLoading(true);
    try {
      const specs = specifications.filter((s) => s.key.trim() && s.value.trim());
      const payload: any = {
        title: formData.title,
        categoryId: formData.categoryId || undefined,
        brandId: formData.brandId || undefined,
        description: formData.description,
        basePrice: Math.round(formData.basePrice * 100),
        comparePrice: formData.comparePrice ? Math.round(formData.comparePrice * 100) : undefined,
        stock: formData.stock,
        sku: formData.sku || undefined,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        images,
        specifications: specs,
        hasVariants,
      };

      if (hasVariants) {
        payload.options = optionDrafts.filter((o) => o.name.trim()).map((o) => ({
          name: o.name,
          values: o.values,
        }));
        payload.variants = variantDrafts.map((v) => ({
          optionValues: v.optionValues,
          price: Math.round(v.price * 100),
          comparePrice: v.comparePrice ? Math.round(v.comparePrice * 100) : undefined,
          stock: v.stock,
          sku: v.sku || undefined,
          isActive: v.isActive,
          images: [],
        }));
      }

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
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEdit ? "Edit Product" : "Create New Product"}
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
            {isEdit ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
            <h2 className="font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Product Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
                placeholder="e.g. Wireless Bluetooth Headphones"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Brand</label>
                <select
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
                placeholder="Detailed product description..."
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
            <h2 className="font-semibold text-gray-900 mb-4">Pricing & Inventory</h2>
            {hasVariants && variantDrafts.length > 0 && (
              <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
                Price, stock, and SKU are managed per variant below.
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Selling Price</label>
                <input
                  name="basePrice"
                  type="number"
                  value={formData.basePrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600 disabled:opacity-50"
                  min="0"
                  required={!hasVariants}
                  disabled={hasVariants && variantDrafts.length > 0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">MRP (Compare)</label>
                <input
                  name="comparePrice"
                  type="number"
                  value={formData.comparePrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600 disabled:opacity-50"
                  min="0"
                  disabled={hasVariants && variantDrafts.length > 0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Stock</label>
                <input
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600 disabled:opacity-50"
                  min="0"
                  required={!hasVariants}
                  disabled={hasVariants && variantDrafts.length > 0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">SKU</label>
                <input
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600 disabled:opacity-50"
                  placeholder="SKU-001"
                  disabled={hasVariants && variantDrafts.length > 0}
                />
              </div>
            </div>
          </div>

          {/* Variants Section */}
          {hasVariants && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Product Options</h2>
                <button
                  type="button"
                  onClick={addOption}
                  className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                  <Plus size={14} /> Add Option
                </button>
              </div>

              {optionDrafts.length === 0 && (
                <p className="text-sm text-gray-500">
                  Add options like Size, Color, Storage to create variants.
                </p>
              )}

              {optionDrafts.map((opt, optIdx) => (
                <div key={optIdx} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex gap-3 items-center">
                    <input
                      value={opt.name}
                      onChange={(e) => updateOptionName(optIdx, e.target.value)}
                      placeholder="Option name (e.g. Size)"
                      className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(optIdx)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Values as chips */}
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((val, valIdx) => (
                      <span
                        key={valIdx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-sm text-gray-700 rounded-full"
                      >
                        {val}
                        <button
                          type="button"
                          onClick={() => removeOptionValue(optIdx, valIdx)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add value input */}
                  <div className="flex gap-2">
                    <input
                      value={newOptionValueInput[optIdx] || ""}
                      onChange={(e) =>
                        setNewOptionValueInput((prev) => ({ ...prev, [optIdx]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addOptionValue(optIdx);
                        }
                      }}
                      placeholder="Type value and press Enter"
                      className="flex-1 px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
                    />
                    <button
                      type="button"
                      onClick={() => addOptionValue(optIdx)}
                      className="px-3 py-1.5 text-sm text-green-600 border border-green-200 rounded hover:bg-green-50 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}

              {/* Generate variants button */}
              {optionDrafts.some((o) => o.name.trim() && o.values.length > 0) && (
                <button
                  type="button"
                  onClick={generateVariants}
                  className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Generate Variants
                </button>
              )}

              {/* Variants table */}
              {variantDrafts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Variants ({variantDrafts.length})
                    </h3>
                    {variantDrafts.length > 100 && (
                      <span className="flex items-center gap-1 text-xs text-amber-600">
                        <AlertTriangle size={12} /> Large variant count
                      </span>
                    )}
                  </div>

                  {/* Bulk actions */}
                  <div className="flex gap-3 items-end flex-wrap">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Set all prices</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={bulkPrice}
                          onChange={(e) => setBulkPrice(e.target.value)}
                          placeholder="0"
                          className="w-24 px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
                          min="0"
                        />
                        <button
                          type="button"
                          onClick={applyBulkPrice}
                          className="px-2 py-1.5 text-xs text-green-600 border border-green-200 rounded hover:bg-green-50"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Set all stocks</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={bulkStock}
                          onChange={(e) => setBulkStock(e.target.value)}
                          placeholder="0"
                          className="w-24 px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
                          min="0"
                        />
                        <button
                          type="button"
                          onClick={applyBulkStock}
                          className="px-2 py-1.5 text-xs text-green-600 border border-green-200 rounded hover:bg-green-50"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left px-3 py-2 font-medium text-gray-600">Variant</th>
                          <th className="text-left px-3 py-2 font-medium text-gray-600 w-28">Price</th>
                          <th className="text-left px-3 py-2 font-medium text-gray-600 w-28">Compare</th>
                          <th className="text-left px-3 py-2 font-medium text-gray-600 w-20">Stock</th>
                          <th className="text-left px-3 py-2 font-medium text-gray-600 w-28">SKU</th>
                          <th className="text-center px-3 py-2 font-medium text-gray-600 w-16">Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variantDrafts.map((v, idx) => (
                          <tr key={idx} className="border-b border-gray-100 last:border-0">
                            <td className="px-3 py-2">
                              <div className="flex gap-1 flex-wrap">
                                {v.optionValues.map((ov, i) => (
                                  <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                    {ov.valueName}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={v.price}
                                onChange={(e) => updateVariant(idx, "price", parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-sm bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
                                min="0"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={v.comparePrice}
                                onChange={(e) => updateVariant(idx, "comparePrice", parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-sm bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
                                min="0"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={v.stock}
                                onChange={(e) => updateVariant(idx, "stock", parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-sm bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
                                min="0"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                value={v.sku}
                                onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                                className="w-full px-2 py-1 text-sm bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
                                placeholder="SKU"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => updateVariant(idx, "isActive", !v.isActive)}
                                className={`w-8 h-5 rounded-full transition-colors relative ${v.isActive ? 'bg-green-600' : 'bg-gray-300'}`}
                              >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${v.isActive ? 'left-3.5' : 'left-0.5'}`} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Specifications */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Specifications</h2>
              <button
                type="button"
                onClick={addSpec}
                className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            {specifications.map((spec, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <input
                  value={spec.key}
                  onChange={(e) => updateSpec(idx, "key", e.target.value)}
                  placeholder="e.g. Weight"
                  className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
                />
                <input
                  value={spec.value}
                  onChange={(e) => updateSpec(idx, "value", e.target.value)}
                  placeholder="e.g. 250g"
                  className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
                />
                <button
                  type="button"
                  onClick={() => removeSpec(idx)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* Status */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
            <h2 className="font-semibold text-gray-900 mb-2">Status</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${formData.isActive ? 'bg-green-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isActive ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Featured</span>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isFeatured: !prev.isFeatured }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${formData.isFeatured ? 'bg-green-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isFeatured ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Has Variants</span>
              <button
                type="button"
                onClick={() => setHasVariants(!hasVariants)}
                className={`w-12 h-6 rounded-full transition-colors relative ${hasVariants ? 'bg-green-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${hasVariants ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
            <h2 className="font-semibold text-gray-900">Product Images</h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">Add Image URL</label>
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
                  className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-green-600"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 text-sm"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
              <p className="text-xs text-gray-500">
                <LinkIcon className="inline w-3 h-3 mr-1" />
                Paste image URL from CDN
              </p>
            </div>
            {images.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  Image Previews ({images.length})
                </label>
                <div className="max-h-[600px] overflow-y-auto pr-2">
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="aspect-square relative rounded overflow-hidden group border border-gray-200">
                        <Image
                          src={img}
                          alt={`Product ${idx + 1}`}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext fill='%231f2937' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage Not Found%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
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
