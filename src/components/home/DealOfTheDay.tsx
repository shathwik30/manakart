"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Clock } from "lucide-react";
import { formatPrice, calculateDiscountPercentage, formatCountdown } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { Deal } from "@/lib/api";

interface DealOfTheDayProps {
  deals: Deal[];
}

export function DealOfTheDay({ deals }: DealOfTheDayProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeDeals = deals.filter((deal) => {
    const end = new Date(deal.endsAt).getTime();
    return end > now;
  });

  if (activeDeals.length === 0) {
    return null;
  }

  return (
    <section className="py-6 px-4 md:px-6">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-900">Today&apos;s Deals</h2>
          <Link
            href="/products"
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            See all deals
          </Link>
        </div>

        {/* Deal cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {activeDeals.slice(0, 4).map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  const { addItem, isLoading } = useCartStore();
  const [countdown, setCountdown] = useState(formatCountdown(deal.endsAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatCountdown(deal.endsAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [deal.endsAt]);

  const { product } = deal;
  const originalPrice = product.comparePrice || product.basePrice;
  const discount = calculateDiscountPercentage(originalPrice, deal.dealPrice);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem({ productId: product.id, quantity: 1 });
  };

  return (
    <Link href={`/product/${product.slug}`} className="block group">
      <div className="flex flex-col h-full bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden mb-3 rounded-lg flex items-center justify-center">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300 p-2"
            />
          ) : (
            <ShoppingCart className="w-10 h-10 text-gray-300" />
          )}

          {/* Discount badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-md z-[3]">
              {discount}% off
            </div>
          )}
        </div>

        {/* Deal price */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-bold text-green-700">
            {formatPrice(deal.dealPrice)}
          </span>
          {originalPrice > deal.dealPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-green-600 transition-colors">
          {product.title}
        </h3>

        {/* Countdown */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-auto">
          <Clock className="w-3 h-3 text-red-500" />
          {countdown === "Expired" ? (
            <span className="text-red-600">Expired</span>
          ) : (
            <span>
              Ends in <span className="font-semibold text-gray-900">{countdown}</span>
            </span>
          )}
        </div>

        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="mt-3 w-full py-2 bg-[#fb641b] hover:bg-[#e65100] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
