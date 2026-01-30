"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  {
    id: "gentlemen",
    title: "Gentlemen",
    subtitle: "Refined Masculinity",
    description: "Impeccably tailored sophistication",
    href: "/collections/gentlemen",
    gradient: "from-charcoal-900 to-charcoal-800",
  },
  {
    id: "lady",
    title: "Lady",
    subtitle: "Effortless Grace",
    description: "Timeless feminine elegance",
    href: "/collections/lady",
    gradient: "from-gold-900 to-gold-800",
  },
  {
    id: "couple",
    title: "Couple",
    subtitle: "Harmonious Unity",
    description: "Perfectly coordinated style",
    href: "/collections/couple",
    gradient: "from-burgundy-900 to-burgundy-800",
  },
];

export function CategoryShowcase() {
  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-cream-50 to-white relative overflow-hidden">
      {/* Elegant background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #1A1A1A 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="container-luxury relative">
        {/* Premium Header */}
        <div className="text-center mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-50 border border-gold-200 mb-6"
          >
            <Sparkles className="w-4 h-4 text-gold-600" />
            <span className="text-sm font-medium text-gold-900 tracking-wide">
              CURATED COLLECTIONS
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal-900 mb-4"
          >
            Discover Your Style
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg text-charcoal-600 max-w-2xl mx-auto"
          >
            Explore our meticulously curated collections, each designed to embody timeless elegance
          </motion.p>
        </div>

        {/* Premium Category Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  index,
}: {
  category: typeof categories[0];
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -12 }}
    >
      <Link href={category.href} className="block h-full">
        <motion.div
          className="relative h-full overflow-hidden rounded-2xl bg-white shadow-soft-lg"
          animate={{
            boxShadow: isHovered
              ? "0 25px 50px -12px rgba(26, 26, 26, 0.25)"
              : "0 8px 32px -8px rgba(26, 26, 26, 0.12)",
          }}
          transition={{ duration: 0.5 }}
        >
          {/* Gradient Background */}
          <motion.div
            className={cn("absolute inset-0 bg-gradient-to-br", category.gradient)}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.05 : 0 }}
            transition={{ duration: 0.5 }}
          />

          {/* Shimmer effect on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-400/10 to-transparent"
                style={{ zIndex: 1 }}
              />
            )}
          </AnimatePresence>

          {/* Decorative border */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2"
            animate={{
              borderColor: isHovered ? "rgba(192, 88, 0, 0.2)" : "transparent",
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Content */}
          <div className="relative p-8 lg:p-10 h-full flex flex-col" style={{ zIndex: 2 }}>
            {/* Number badge */}
            <motion.div
              className="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center"
              animate={{
                backgroundColor: isHovered ? "rgba(192, 88, 0, 0.1)" : "rgba(253, 251, 212, 0.5)",
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? 360 : 0,
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.span
                className="font-display text-lg"
                animate={{
                  color: isHovered ? "rgb(113, 54, 0)" : "rgb(87, 56, 28)",
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </motion.span>
            </motion.div>

            {/* Text content */}
            <div className="flex-1 flex flex-col justify-center">
              <motion.p
                className="text-sm font-medium tracking-wider uppercase mb-3"
                initial={{ color: "rgb(113, 54, 0)" }}
                animate={{
                  color: isHovered ? "rgb(192, 88, 0)" : "rgb(113, 54, 0)",
                  x: isHovered ? 4 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                {category.subtitle}
              </motion.p>

              <motion.h3
                className="font-display text-3xl lg:text-4xl mb-4"
                animate={{
                  color: isHovered ? "rgb(113, 54, 0)" : "rgb(56, 36, 13)",
                }}
                transition={{ duration: 0.3 }}
              >
                {category.title}
              </motion.h3>

              <p className="text-charcoal-600 mb-8 leading-relaxed">
                {category.description}
              </p>

              {/* CTA */}
              <div className="flex items-center gap-2">
                <motion.span
                  className="font-medium"
                  animate={{
                    color: isHovered ? "rgb(192, 88, 0)" : "rgb(56, 36, 13)",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  Explore Collection
                </motion.span>
                <motion.div
                  animate={{ x: isHovered ? 8 : 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ArrowRight
                    className={cn(
                      "w-5 h-5 transition-colors duration-300",
                      isHovered ? "text-gold-600" : "text-charcoal-900"
                    )}
                  />
                </motion.div>
              </div>
            </div>

            {/* Decorative line */}
            <motion.div
              className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                scaleX: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
