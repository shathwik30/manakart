"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, SlidersHorizontal } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Badge, Button } from "@/components/ui";
import { Outfit } from "@/lib/api";
interface CollectionGridProps {
  outfits: Outfit[];
  collectionType: string;
}
const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
];
export function CollectionGrid({ outfits, collectionType }: CollectionGridProps) {
  const [sortBy, setSortBy] = useState("featured");
  const sortedOutfits = [...outfits].sort((a, b) => {
    switch (sortBy) {
      case "price_asc":
        return a.bundlePrice - b.bundlePrice;
      case "price_desc":
        return b.bundlePrice - a.bundlePrice;
      case "newest":
        return -1; 
      default:
        return a.isFeatured ? -1 : 1;
    }
  });
  return (
    <section className="section bg-cream-100">
      <div className="container-luxury">
        {}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <p className="text-charcoal-600">
            Showing <span className="font-medium text-charcoal-900">{outfits.length}</span> outfits
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-charcoal-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-sm text-charcoal-700 font-medium focus:outline-none cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {}
        {sortedOutfits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {sortedOutfits.map((outfit, index) => (
              <OutfitCard key={outfit.id} outfit={outfit} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-cream-200 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-charcoal-400" />
            </div>
            <h3 className="font-display text-xl text-charcoal-900 mb-2">
              No Outfits Found
            </h3>
            <p className="text-charcoal-600 mb-8">
              We&apos;re working on new pieces for this collection.
            </p>
            <Link href="/collections">
              <Button variant="secondary">View All Collections</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
function OutfitCard({ outfit, index }: { outfit: Outfit; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/outfit/${outfit.slug}`} className="group block">
        {}
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-cream-200 mb-4">
          {outfit.heroImages?.[0] ? (
            <Image
              src={outfit.heroImages[0]}
              alt={outfit.title}
              fill
              className="object-cover img-zoom"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-charcoal-300" />
            </div>
          )}
          {}
          <div className="absolute inset-0 bg-charcoal-900/0 group-hover:bg-charcoal-900/20 transition-colors duration-500" />
          {}
          <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 text-center">
              <span className="text-sm font-medium text-charcoal-900">
                View Outfit
              </span>
            </div>
          </div>
        </div>
        {}
        <div className="space-y-2">
          <h3 className="font-display text-lg text-charcoal-900 group-hover:text-gold-600 transition-colors">
            {outfit.title}
          </h3>
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl text-charcoal-900">
              {formatPrice(outfit.bundlePrice)}
            </span>
          </div>
          <p className="text-sm text-charcoal-500">
            {outfit.products?.length || 0} pieces included
          </p>
        </div>
      </Link>
    </motion.div>
  );
}