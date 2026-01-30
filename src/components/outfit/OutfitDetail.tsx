"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Truck,
  RotateCcw,
  Shield,
  Check,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button, Badge, Divider } from "@/components/ui";
import { useCartStore } from "@/store/useCartStore";
import { OutfitDetail as OutfitDetailType, Product } from "@/lib/api";
import toast from "react-hot-toast";

interface OutfitDetailProps {
  outfit: OutfitDetailType;
}

export function OutfitDetail({ outfit }: OutfitDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const { addItem, isLoading } = useCartStore();

  const images = outfit.heroImages || [];
  const products = outfit.products || [];

  const allSizesSelected = products.every(
    (product) => selectedSizes[product.id]
  );

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
  };

  const handleAddToCart = async () => {
    if (!allSizesSelected) {
      toast.error("Please select sizes for all items");
      return;
    }

    await addItem({
      outfitId: outfit.id,
      selectedSizes,
      quantity: 1,
      isBundle: true,
    });
  };

  const handleAddSingleProduct = async (productId: string) => {
    const size = selectedSizes[productId];
    if (!size) {
      toast.error("Please select a size");
      return;
    }

    setAddingProductId(productId);
    try {
      await addItem({
        productId,
        selectedSizes: { size },
        quantity: 1,
        isBundle: false,
      });
    } finally {
      setAddingProductId(null);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="pt-32 pb-20 bg-cream-100">
      <div className="container-luxury">
        {}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-charcoal-500">
            <li>
              <Link href="/" className="hover:text-charcoal-900 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href={`/collections/${outfit.genderType.toLowerCase()}`}
                className="hover:text-charcoal-900 transition-colors"
              >
                {outfit.genderType.charAt(0) + outfit.genderType.slice(1).toLowerCase()}
              </Link>
            </li>
            <li>/</li>
            <li className="text-charcoal-900">{outfit.title}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {}
          <div className="space-y-4">
            {}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-cream-200">
              {images.length > 0 ? (
                <Image
                  src={images[currentImageIndex]}
                  alt={outfit.title}
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-charcoal-400">No image available</span>
                </div>
              )}

              {}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-charcoal-700 hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-charcoal-700 hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors",
                      index === currentImageIndex
                        ? "border-charcoal-900"
                        : "border-transparent hover:border-charcoal-300"
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${outfit.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {}
              <div className="mb-6">
                <p className="overline text-gold-600 mb-2">Complete Outfit</p>
                <h1 className="font-display text-3xl md:text-4xl text-charcoal-900 mb-4">
                  {outfit.title}
                </h1>

                <div className="flex items-center gap-4">
                  <span className="font-serif text-3xl text-charcoal-900">
                    {formatPrice(outfit.bundlePrice)}
                  </span>
                </div>
              </div>

              {}
              {outfit.description && (
                <p className="text-charcoal-600 leading-relaxed mb-8">
                  {outfit.description}
                </p>
              )}

              <Divider className="mb-8" />

              {}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg text-charcoal-900">
                    What&apos;s Included ({products.length} pieces)
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Buy individual items or the complete outfit
                  </p>
                </div>

                <div className="space-y-6">
                  {products.map((product) => (
                    <ProductSizeSelector
                      key={product.id}
                      product={product}
                      selectedSize={selectedSizes[product.id] || ""}
                      onSizeSelect={(size) => handleSizeSelect(product.id, size)}
                      onAddToCart={() => handleAddSingleProduct(product.id)}
                      isAddingToCart={addingProductId === product.id}
                    />
                  ))}
                </div>
              </div>

              {}
              <div className="flex gap-4 mb-8">
                <Button
                  variant="primary"
                  size="xl"
                  fullWidth
                  onClick={handleAddToCart}
                  isLoading={isLoading}
                  disabled={!allSizesSelected}
                >
                  {allSizesSelected ? "Add Complete Outfit to Bag" : "Select All Sizes"}
                </Button>

                <Button variant="secondary" size="xl" className="flex-shrink-0">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {}
              <div className="grid grid-cols-3 gap-4 p-6 bg-cream-200 rounded-2xl">
                <div className="text-center">
                  <Truck className="w-6 h-6 text-gold-600 mx-auto mb-2" />
                  <p className="text-xs text-charcoal-600">Delivered with</p>
                  <p className="text-xs text-gold-600 font-medium">Distinction</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 text-charcoal-700 mx-auto mb-2" />
                  <p className="text-xs text-charcoal-600">Easy Returns</p>
                  <p className="text-xs text-charcoal-500">15-day policy</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 text-charcoal-700 mx-auto mb-2" />
                  <p className="text-xs text-charcoal-600">Secure Checkout</p>
                  <p className="text-xs text-charcoal-500">100% Protected</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductSizeSelector({
  product,
  selectedSize,
  onSizeSelect,
  onAddToCart,
  isAddingToCart,
}: {
  product: Product;
  selectedSize: string;
  onSizeSelect: (size: string) => void;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}) {
  const stockPerSize = product.stockPerSize || {};

  return (
    <div className="flex gap-4 p-4 bg-white rounded-xl">
      {}
      <Link
        href={`/product/${product.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-20 h-24 rounded-lg overflow-hidden bg-cream-200 flex-shrink-0 hover:opacity-90 transition-opacity"
      >
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
      </Link>

      {}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <Link href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" className="hover:text-gold-600 transition-colors">
              <h4 className="font-medium text-charcoal-900 truncate">
                {product.title}
              </h4>
            </Link>
            <p className="text-sm text-charcoal-500 capitalize">
              {product.category}
            </p>
          </div>
          <span className="text-sm text-charcoal-600">
            {formatPrice(product.basePrice)}
          </span>
        </div>

        {}
        <div className="flex flex-wrap gap-2">
          {product.availableSizes?.map((size) => {
            const stock = stockPerSize[size] || 0;
            const isOutOfStock = stock === 0;
            const isSelected = selectedSize === size;

            return (
              <button
                key={size}
                onClick={() => !isOutOfStock && onSizeSelect(size)}
                disabled={isOutOfStock}
                className={cn(
                  "min-w-[40px] h-9 px-3 text-sm font-medium rounded-lg border transition-all",
                  isSelected
                    ? "bg-charcoal-900 text-cream-100 border-charcoal-900"
                    : isOutOfStock
                    ? "bg-charcoal-50 text-charcoal-300 border-charcoal-100 cursor-not-allowed"
                    : "bg-white text-charcoal-700 border-charcoal-200 hover:border-charcoal-400"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>

        {}
        <div className="flex items-center justify-between mt-3">
          {selectedSize ? (
            <div className="flex items-center gap-1 text-xs text-gold-600">
              <Check className="w-3 h-3" />
              <span>Size {selectedSize} selected</span>
            </div>
          ) : (
            <span className="text-xs text-charcoal-400">Select a size</span>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={onAddToCart}
            disabled={!selectedSize || isAddingToCart}
            className="text-xs"
          >
            {isAddingToCart ? "Adding..." : "Add to Bag"}
          </Button>
        </div>
      </div>
    </div>
  );
}