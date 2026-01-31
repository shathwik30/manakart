"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn, formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { Button, Badge } from "@/components/ui";
import { TopFits, OutfitCard } from "@/lib/api";
interface FeaturedOutfitsProps {
  topFits: TopFits;
}
const tabs = [
  { id: "gentlemen", label: "Gentlemen" },
  { id: "lady", label: "Lady" },
  { id: "couple", label: "Couple" },
];
export function FeaturedOutfits({ topFits }: FeaturedOutfitsProps) {
  const [activeTab, setActiveTab] = useState("gentlemen");
  const getOutfits = () => {
    switch (activeTab) {
      case "gentlemen":
        return topFits.gentlemen;
      case "lady":
        return topFits.lady;
      case "couple":
        return topFits.couple;
      default:
        return [];
    }
  };
  const outfits = getOutfits();
  return (
    <section className="section bg-cream-100">
      <div className="container-luxury">
        {}
        <div className="text-center mb-12 lg:mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overline text-gold-600 mb-4"
          >
            Curated Collections
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal-900 mb-6"
          >
            Top Fits This Season
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-charcoal-600 max-w-2xl mx-auto"
          >
            Discover our expertly curated outfits, designed to elevate your
            wardrobe with timeless sophistication.
          </motion.p>
        </div>
        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex p-1.5 bg-cream-200 rounded-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300",
                  activeTab === tab.id
                    ? "bg-charcoal-900 text-cream-100 shadow-soft-md"
                    : "text-charcoal-600 hover:text-charcoal-900"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>
        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {outfits.map((outfit, index) => (
            <OutfitCardComponent key={outfit.id} outfit={outfit} index={index} />
          ))}
        </div>
        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12 lg:mt-16"
        >
          <Link href={`/collections/${activeTab}`}>
            <Button
              variant="secondary"
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              View All {tabs.find((t) => t.id === activeTab)?.label} Outfits
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
function OutfitCardComponent({
  outfit,
  index,
}: {
  outfit: OutfitCard;
  index: number;
}) {
  const discount = calculateDiscountPercentage(
    outfit.individualTotal,
    outfit.bundlePrice
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/outfit/${outfit.slug}`} className="group block">
        {}
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-cream-200 mb-4">
          {outfit.heroImage ? (
            <Image
              src={outfit.heroImage}
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
          {discount > 0 && (
            <div className="absolute top-4 left-4">
              <Badge variant="gold">Save {discount}%</Badge>
            </div>
          )}
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
            {outfit.individualTotal > outfit.bundlePrice && (
              <span className="font-serif text-sm text-charcoal-400 line-through">
                {formatPrice(outfit.individualTotal)}
              </span>
            )}
          </div>
          <p className="text-sm text-charcoal-500">
            {outfit.productCount} pieces included
          </p>
        </div>
      </Link>
    </motion.div>
  );
}