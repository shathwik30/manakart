"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, SlidersHorizontal, Heart } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Badge, Button } from "@/components/ui";
import { ScrollRevealItem, ScrollRevealStagger } from "@/components/ui";
import { Product } from "@/lib/api";
interface ProductsGridProps {
  products: Product[];
}
const sortOptions = [
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
];
export function ProductsGrid({ products }: ProductsGridProps) {
  const [sortBy, setSortBy] = useState("price_asc");
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price_asc":
        return a.basePrice - b.basePrice;
      case "price_desc":
        return b.basePrice - a.basePrice;
      default:
        return 0;
    }
  });
  return (
    <div>
      {}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <p className="text-charcoal-600">
          Showing{" "}
          <span className="font-medium text-charcoal-900">
            {products.length}
          </span>{" "}
          products
        </p>
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
      {}
      {sortedProducts.length > 0 ? (
        <ScrollRevealStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {sortedProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </ScrollRevealStagger>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-cream-200 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-charcoal-400" />
          </div>
          <h3 className="font-display text-xl text-charcoal-900 mb-2">
            No Products Found
          </h3>
          <p className="text-charcoal-600 mb-8">
            Check back soon for new arrivals.
          </p>
          <Link href="/collections">
            <Button variant="secondary">View Collections</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
function ProductCard({ product, index }: { product: Product; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const stockValues = Object.values(product.stockPerSize || {});
  const totalStock = stockValues.reduce((sum: number, val) => sum + (val as number), 0);
  const isOutOfStock = totalStock === 0;
  return (
    <ScrollRevealItem>
      <motion.div
        className="group"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link href={`/product/${product.id}`} className="block">
          {/* Image Container */}
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-cream-200 mb-4 shadow-soft-md group-hover:shadow-elegant transition-shadow duration-700">
            {product.images?.[0] ? (
              <motion.div
                className="relative w-full h-full"
                initial={false}
                animate={{ scale: isHovered ? 1.08 : 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </motion.div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-charcoal-300" />
              </div>
            )}
            {/* Dark overlay on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-charcoal-900/40 via-transparent to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            />
            {/* Out of stock badge */}
            {isOutOfStock && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 left-4"
              >
                <Badge variant="dark">Out of Stock</Badge>
              </motion.div>
            )}
            {/* Favorite button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 0.8,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                setIsFavorite(!isFavorite);
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors z-10"
            >
              <Heart
                className={cn(
                  "w-5 h-5 transition-colors",
                  isFavorite ? "fill-burgundy-500 text-burgundy-500" : "text-charcoal-700"
                )}
              />
            </motion.button>
            {/* Quick view CTA */}
            <motion.div
              className="absolute inset-x-4 bottom-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                y: isHovered ? 0 : 20,
              }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="backdrop-luxury rounded-xl px-6 py-3 text-center border border-charcoal-900/10">
                <span className="text-sm font-medium text-charcoal-900">
                  View Details
                </span>
              </div>
            </motion.div>
          </div>
          {/* Product info */}
          <div className="space-y-2">
            <motion.p
              className="text-xs uppercase tracking-wider text-charcoal-500 font-medium"
              initial={false}
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {product.category}
            </motion.p>
            <h3 className="font-display text-lg text-charcoal-900 group-hover:text-gold-600 transition-colors duration-300 line-clamp-2">
              {product.title}
            </h3>
            <div className="flex items-baseline gap-2">
              <p className="font-serif text-xl text-charcoal-900">
                {formatPrice(product.basePrice)}
              </p>
            </div>
          </div>
        </Link>
      </motion.div>
    </ScrollRevealItem>
  );
}