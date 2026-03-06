"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  ShoppingBag,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  Shield,
  MapPin,
} from "lucide-react";
import { cn, formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { Rating } from "@/components/ui";
import { useCartStore } from "@/store/useCartStore";
import { ProductReviews } from "@/components/products/ProductReviews";
import { Product, ProductSpecification, ProductVariant } from "@/lib/api";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem, isLoading } = useCartStore();

  const hasVariants = product.hasVariants && product.options && product.variants && product.variants.length > 0;
  const options = product.options || [];
  const variants = product.variants || [];

  // Variant selection state: { optionName: selectedValueName }
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Initialize with first available (in-stock, active) variant's option values
  useEffect(() => {
    if (hasVariants && options.length > 0 && variants.length > 0) {
      const firstAvailable = variants.find((v) => v.isActive && v.stock > 0) || variants[0];
      const initial: Record<string, string> = {};
      firstAvailable.optionValues.forEach((ov) => {
        initial[ov.optionName] = ov.valueName;
      });
      setSelectedOptions(initial);
    }
  }, []);

  // Find the selected variant based on current option selections
  const selectedVariant = useMemo<ProductVariant | null>(() => {
    if (!hasVariants) return null;
    const optionNames = options.map((o) => o.name);
    if (optionNames.some((name) => !selectedOptions[name])) return null;

    return variants.find((v) =>
      v.isActive &&
      v.optionValues.every((ov) => selectedOptions[ov.optionName] === ov.valueName)
    ) || null;
  }, [hasVariants, options, variants, selectedOptions]);

  // Availability matrix: for each option value, check if any variant with that value is in stock
  const isValueAvailable = (optionName: string, valueName: string): boolean => {
    if (!hasVariants) return true;
    // Check if any active, in-stock variant has this value AND is compatible with other current selections
    return variants.some((v) => {
      if (!v.isActive || v.stock <= 0) return false;
      const hasValue = v.optionValues.some((ov) => ov.optionName === optionName && ov.valueName === valueName);
      if (!hasValue) return false;
      // Check compatibility with other selected options
      for (const [otherOption, otherValue] of Object.entries(selectedOptions)) {
        if (otherOption === optionName) continue;
        const variantHasOther = v.optionValues.some((ov) => ov.optionName === otherOption && ov.valueName === otherValue);
        if (!variantHasOther) return false;
      }
      return true;
    });
  };

  // Derived values based on variant or product
  const displayPrice = selectedVariant ? selectedVariant.price : product.basePrice;
  const displayComparePrice = selectedVariant ? selectedVariant.comparePrice : product.comparePrice;
  const displayStock = selectedVariant ? selectedVariant.stock : product.stock ?? 0;
  const displayImages = (selectedVariant && selectedVariant.images.length > 0)
    ? selectedVariant.images
    : product.images || [];

  const discount =
    displayComparePrice && displayComparePrice > displayPrice
      ? calculateDiscountPercentage(displayComparePrice, displayPrice)
      : 0;
  const specifications = (product.specifications as ProductSpecification[]) || [];
  const isOutOfStock = displayStock === 0;
  const avgRating = product.reviewStats?.averageRating || 0;
  const totalReviews = product.reviewStats?.totalReviews || 0;

  const handleSelectOption = (optionName: string, valueName: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: valueName }));
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (hasVariants && !selectedVariant) {
      const { toast } = await import("react-hot-toast");
      toast.error("Please select all options");
      return;
    }
    await addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity,
    });
  };

  const handleBuyNow = async () => {
    if (hasVariants && !selectedVariant) {
      const { toast } = await import("react-hot-toast");
      toast.error("Please select all options");
      return;
    }
    await addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity,
    });
    window.location.href = "/checkout";
  };

  return (
    <div className="bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-6">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
            <li>
              <Link
                href="/"
                className="text-green-600 hover:text-green-700 hover:underline"
              >
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li>
              <Link
                href="/products"
                className="text-green-600 hover:text-green-700 hover:underline"
              >
                Products
              </Link>
            </li>
            {product.category?.name && (
              <>
                <li>
                  <ChevronRight className="w-3.5 h-3.5" />
                </li>
                <li>
                  <span className="text-green-600">{product.category.name}</span>
                </li>
              </>
            )}
            <li>
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li className="text-gray-900 truncate max-w-xs">{product.title}</li>
          </ol>
        </nav>

        {/* Main Product Section — 3-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr_280px] xl:grid-cols-[460px_1fr_300px] gap-6 lg:gap-8">
          {/* LEFT COLUMN — Image Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-3">
            {/* Thumbnails */}
            {displayImages.length > 1 && (
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[500px] no-scrollbar flex-shrink-0">
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onMouseEnter={() => setCurrentImageIndex(index)}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "relative w-14 h-14 lg:w-[52px] lg:h-[52px] flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all bg-white",
                      index === currentImageIndex
                        ? "border-green-600 shadow-[0_0_0_1px_rgba(56,142,60,0.3)]"
                        : "border-gray-200 hover:border-gray-400"
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="relative flex-1 aspect-square bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
              {displayImages.length > 0 ? (
                <Image
                  src={displayImages[currentImageIndex] || displayImages[0]}
                  alt={product.title}
                  fill
                  priority
                  className="object-contain p-6"
                />
              ) : (
                <ShoppingBag className="w-20 h-20 text-gray-300" />
              )}
            </div>
          </div>

          {/* MIDDLE COLUMN — Product Info */}
          <div className="min-w-0">
            {/* Title */}
            <h1 className="text-xl lg:text-2xl text-gray-900 leading-8 mb-1 font-semibold">
              {product.title}
            </h1>

            {/* Brand */}
            {product.brand?.name && (
              <p className="text-sm mb-2">
                <span className="text-gray-500">Brand: </span>
                <span className="text-green-600 hover:text-green-700 cursor-pointer">
                  {product.brand.name}
                </span>
              </p>
            )}

            {/* Rating */}
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-900 font-medium">
                  {avgRating.toFixed(1)}
                </span>
                <Rating value={avgRating} size="sm" />
                <a
                  href="#reviews"
                  className="text-sm text-green-600 hover:text-green-700 hover:underline"
                >
                  {totalReviews.toLocaleString()} rating{totalReviews !== 1 ? "s" : ""}
                </a>
              </div>
            )}

            <hr className="border-gray-200 my-4" />

            {/* Price Block */}
            <div className="mb-4">
              {discount > 0 && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-semibold text-red-600">
                    -{discount}%
                  </span>
                  <span className="text-[28px] text-gray-900 font-light">
                    {formatPrice(displayPrice)}
                  </span>
                </div>
              )}
              {!discount && (
                <div className="mb-1">
                  <span className="text-[28px] text-gray-900 font-light">
                    {formatPrice(displayPrice)}
                  </span>
                </div>
              )}
              {displayComparePrice && displayComparePrice > displayPrice && (
                <p className="text-sm text-gray-500">
                  M.R.P.:{" "}
                  <span className="line-through">{formatPrice(displayComparePrice)}</span>
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Inclusive of all taxes
              </p>
            </div>

            {/* Variant Option Selectors */}
            {hasVariants && options.map((option) => (
              <div key={option.id} className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {option.name}: <span className="text-gray-900">{selectedOptions[option.name] || ""}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((val) => {
                    const isSelected = selectedOptions[option.name] === val.value;
                    const available = isValueAvailable(option.name, val.value);
                    return (
                      <button
                        key={val.id}
                        type="button"
                        onClick={() => handleSelectOption(option.name, val.value)}
                        disabled={!available}
                        className={cn(
                          "px-4 py-2 text-sm rounded-lg border-2 transition-all font-medium",
                          isSelected
                            ? "border-green-600 bg-green-50 text-green-700"
                            : available
                              ? "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                              : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                        )}
                      >
                        {val.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Delivery info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600 font-medium">FREE Delivery</span>
              </div>
            </div>

            <hr className="border-gray-200 my-4" />

            {/* About this item */}
            {product.description && (
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  About this item
                </h3>
                <ul className="space-y-1.5 text-sm text-gray-700 leading-6">
                  {product.description.split(/[.\n]/).filter(Boolean).map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-gray-400 mt-1.5 flex-shrink-0">
                        &bull;
                      </span>
                      <span>{line.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications Table */}
            {specifications.length > 0 && (
              <div className="mt-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Product Information
                </h3>
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {specifications.map(
                      (spec: ProductSpecification, index: number) => (
                        <tr
                          key={index}
                          className={cn(
                            "border-t border-gray-200",
                            index === specifications.length - 1 &&
                              "border-b"
                          )}
                        >
                          <td className="py-2.5 pr-4 text-gray-500 font-medium w-2/5 align-top">
                            {spec.key}
                          </td>
                          <td className="py-2.5 text-gray-900">{spec.value}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — Buy Box */}
          <div className="lg:order-last">
            <div className="border border-gray-200 rounded-xl p-5 sticky top-28 shadow-sm">
              {/* Price in Buy Box */}
              <div className="mb-3">
                <span className="text-[24px] font-semibold text-gray-900">
                  {formatPrice(displayPrice)}
                </span>
                {displayComparePrice && displayComparePrice > displayPrice && (
                  <div className="text-sm text-gray-500 mt-0.5">
                    M.R.P.:{" "}
                    <span className="line-through">
                      {formatPrice(displayComparePrice)}
                    </span>
                  </div>
                )}
              </div>

              {/* Selected variant info */}
              {hasVariants && selectedVariant && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {selectedVariant.optionValues.map((ov, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                      {ov.optionName}: {ov.valueName}
                    </span>
                  ))}
                </div>
              )}

              {/* Delivery info */}
              <div className="flex items-start gap-2 mb-3">
                <Truck className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="text-emerald-600 font-medium">FREE Delivery</span>
                  <span className="text-gray-700">
                    {" "}on orders over {formatPrice(49900)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 mb-3">
                <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-green-600">
                  Delivering across India
                </span>
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                {isOutOfStock ? (
                  <p className="text-lg text-red-600 font-medium">
                    Currently unavailable
                  </p>
                ) : displayStock <= 5 ? (
                  <div>
                    <p className="text-lg text-emerald-600 font-medium">In Stock</p>
                    <p className="text-sm text-red-600">
                      Only {displayStock} left in stock - order soon.
                    </p>
                  </div>
                ) : (
                  <p className="text-lg text-emerald-600 font-medium">In Stock</p>
                )}
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="mb-4">
                  <label className="text-sm text-gray-700 mb-1.5 block font-medium">
                    Quantity:
                  </label>
                  <div className="inline-flex items-center border border-gray-300 rounded-lg bg-gray-50">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-l-lg transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-x border-gray-300 min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(displayStock || 10, q + 1))
                      }
                      className="px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-r-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              {!isOutOfStock && (
                <button
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 mb-2 text-sm font-semibold text-white bg-[#ff9f00] rounded-lg hover:bg-[#e68a00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? "Adding..." : "Add to Cart"}
                </button>
              )}

              {/* Buy Now */}
              {!isOutOfStock && (
                <button
                  onClick={handleBuyNow}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 mb-3 text-sm font-semibold text-white bg-[#fb641b] rounded-lg hover:bg-[#e65100] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Buy Now
                </button>
              )}

              {/* Secure / Returns */}
              <div className="border-t border-gray-200 pt-4 mt-1 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Secure transaction</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>15-day replacement policy</span>
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-gray-500">Ships from</span>
                  <span className="text-gray-900">ManaKart</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Sold by</span>
                  <span className="text-green-600">ManaKart</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div id="reviews" className="mt-12 border-t border-gray-200 pt-8">
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </div>
  );
}
