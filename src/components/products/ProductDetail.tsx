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
  ShoppingBag,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button, Badge, Divider } from "@/components/ui";
import { useCartStore } from "@/store/useCartStore";
import { Product } from "@/lib/api";
import toast from "react-hot-toast";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");

  const { addItem, isLoading } = useCartStore();

  const images = product.images || [];
  const stockPerSize = product.stockPerSize || {};

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Kindly select your preferred size");
      return;
    }

    await addItem({
      productId: product.id,
      selectedSizes: { size: selectedSize },
      quantity: 1,
      isBundle: false,
    });
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
                href="/products"
                className="hover:text-charcoal-900 transition-colors"
              >
                Products
              </Link>
            </li>
            <li>/</li>
            <li className="text-charcoal-900">{product.title}</li>
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
                  alt={product.title}
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-16 h-16 text-charcoal-300" />
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
                      alt={`${product.title} ${index + 1}`}
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
              <p className="overline text-gold-600 mb-2 capitalize">
                {product.category}
              </p>
              <h1 className="font-display text-3xl md:text-4xl text-charcoal-900 mb-4">
                {product.title}
              </h1>

              {}
              <p className="font-serif text-3xl text-charcoal-900 mb-6">
                {formatPrice(product.basePrice)}
              </p>

              {}
              {product.description && (
                <p className="text-charcoal-600 leading-relaxed mb-8">
                  {product.description}
                </p>
              )}

              <Divider className="mb-8" />

              {}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-charcoal-900">Select Size</h3>
                  <button className="text-sm text-charcoal-600 hover:text-charcoal-900 underline">
                    Size Guide
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {product.availableSizes?.map((size) => {
                    const stock = stockPerSize[size] || 0;
                    const isOutOfStock = stock === 0;
                    const isSelected = selectedSize === size;

                    return (
                      <button
                        key={size}
                        onClick={() => !isOutOfStock && setSelectedSize(size)}
                        disabled={isOutOfStock}
                        className={cn(
                          "min-w-[56px] h-12 px-4 text-sm font-medium rounded-lg border-2 transition-all",
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
              </div>

              {}
              <div className="flex gap-4 mb-8">
                <Button
                  variant="primary"
                  size="xl"
                  fullWidth
                  onClick={handleAddToCart}
                  isLoading={isLoading}
                  disabled={!selectedSize}
                >
                  {selectedSize ? "Add to Bag" : "Select a Size"}
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