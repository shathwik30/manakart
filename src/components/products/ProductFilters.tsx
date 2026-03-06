"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category, Brand } from "@/lib/api";

interface FilterValues {
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
}

interface ProductFiltersProps {
  categories?: Category[];
  brands?: Brand[];
  onFilterChange: (filters: FilterValues) => void;
  currentFilters?: FilterValues;
}

const priceRanges = [
  { label: "Under \u20B9500", min: 0, max: 50000 },
  { label: "\u20B9500 - \u20B91,000", min: 50000, max: 100000 },
  { label: "\u20B91,000 - \u20B92,000", min: 100000, max: 200000 },
  { label: "\u20B92,000 - \u20B95,000", min: 200000, max: 500000 },
  { label: "\u20B95,000 - \u20B910,000", min: 500000, max: 1000000 },
  { label: "Over \u20B910,000", min: 1000000, max: undefined },
];

export function ProductFilters({
  categories = [],
  brands = [],
  onFilterChange,
  currentFilters = {},
}: ProductFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState(
    currentFilters.categoryId || ""
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    currentFilters.brandId ? [currentFilters.brandId] : []
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(
    null
  );
  const [selectedRating, setSelectedRating] = useState(
    currentFilters.rating || 0
  );
  const [inStockOnly, setInStockOnly] = useState(
    currentFilters.inStock || false
  );

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    brand: true,
    price: true,
    rating: true,
    availability: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const applyFilters = (overrides?: Partial<{
    category: string;
    brands: string[];
    priceIdx: number | null;
    rating: number;
    inStock: boolean;
  }>) => {
    const cat = overrides?.category ?? selectedCategory;
    const br = overrides?.brands ?? selectedBrands;
    const pi = overrides?.priceIdx !== undefined ? overrides.priceIdx : selectedPriceRange;
    const rat = overrides?.rating ?? selectedRating;
    const stock = overrides?.inStock ?? inStockOnly;

    const priceRange = pi !== null ? priceRanges[pi] : null;

    onFilterChange({
      categoryId: cat || undefined,
      brandId: br.length > 0 ? br[0] : undefined,
      minPrice: priceRange?.min,
      maxPrice: priceRange?.max,
      rating: rat || undefined,
      inStock: stock || undefined,
    });
  };

  const handleCategoryChange = (catId: string) => {
    const newCat = selectedCategory === catId ? "" : catId;
    setSelectedCategory(newCat);
    applyFilters({ category: newCat });
  };

  const handleBrandToggle = (brandId: string) => {
    const newBrands = selectedBrands.includes(brandId)
      ? selectedBrands.filter((id) => id !== brandId)
      : [...selectedBrands, brandId];
    setSelectedBrands(newBrands);
    applyFilters({ brands: newBrands });
  };

  const handlePriceChange = (index: number) => {
    const newIdx = selectedPriceRange === index ? null : index;
    setSelectedPriceRange(newIdx);
    applyFilters({ priceIdx: newIdx });
  };

  const handleRatingChange = (rating: number) => {
    const newRating = selectedRating === rating ? 0 : rating;
    setSelectedRating(newRating);
    applyFilters({ rating: newRating });
  };

  const handleStockToggle = () => {
    const newVal = !inStockOnly;
    setInStockOnly(newVal);
    applyFilters({ inStock: newVal });
  };

  return (
    <div className="text-sm">
      {/* Category Filter */}
      {categories.length > 0 && (
        <FilterSection
          title="Department"
          isOpen={openSections.category}
          onToggle={() => toggleSection("category")}
        >
          <ul className="space-y-1 max-h-60 overflow-y-auto">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => handleCategoryChange(cat.id)}
                  className={cn(
                    "text-sm text-left w-full py-0.5 transition-colors",
                    selectedCategory === cat.id
                      ? "text-green-600 font-semibold"
                      : "text-gray-700 hover:text-green-600"
                  )}
                >
                  {cat.name}
                </button>
                {cat.children && cat.children.length > 0 && (
                  <ul className="ml-4 space-y-0.5">
                    {cat.children.map((child) => (
                      <li key={child.id}>
                        <button
                          onClick={() => handleCategoryChange(child.id)}
                          className={cn(
                            "text-sm text-left w-full py-0.5 transition-colors",
                            selectedCategory === child.id
                              ? "text-green-600 font-semibold"
                              : "text-gray-700 hover:text-green-600"
                          )}
                        >
                          {child.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* Brand Filter */}
      {brands.length > 0 && (
        <FilterSection
          title="Brand"
          isOpen={openSections.brand}
          onToggle={() => toggleSection("brand")}
        >
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {brands.map((brand) => (
              <label
                key={brand.id}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.id)}
                  onChange={() => handleBrandToggle(brand.id)}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 accent-green-600 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-green-600 transition-colors">
                  {brand.name}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection
        title="Price"
        isOpen={openSections.price}
        onToggle={() => toggleSection("price")}
      >
        <ul className="space-y-1">
          {priceRanges.map((range, index) => (
            <li key={index}>
              <button
                onClick={() => handlePriceChange(index)}
                className={cn(
                  "text-sm text-left w-full py-0.5 transition-colors",
                  selectedPriceRange === index
                    ? "text-green-600 font-semibold"
                    : "text-gray-700 hover:text-green-600"
                )}
              >
                {range.label}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Customer Review */}
      <FilterSection
        title="Customer Review"
        isOpen={openSections.rating}
        onToggle={() => toggleSection("rating")}
      >
        <div className="space-y-1">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={cn(
                "flex items-center gap-1.5 w-full py-0.5 transition-colors group",
                selectedRating === rating && "font-semibold"
              )}
            >
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < rating
                        ? "fill-amber-500 text-amber-500"
                        : "text-gray-200 fill-gray-200"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-700 group-hover:text-green-600">
                & Up
              </span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection
        title="Availability"
        isOpen={openSections.availability}
        onToggle={() => toggleSection("availability")}
      >
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={handleStockToggle}
            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 accent-green-600 cursor-pointer"
          />
          <span className="text-sm text-gray-700 group-hover:text-green-600 transition-colors">
            Include Out of Stock
          </span>
        </label>
      </FilterSection>
    </div>
  );
}

function FilterSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-200 pb-3 mb-3 last:border-0 last:mb-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-1 text-sm font-semibold text-gray-900 cursor-pointer"
      >
        {title}
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
}
