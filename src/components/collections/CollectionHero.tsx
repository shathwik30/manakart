"use client";
import Image from "next/image";
import { motion } from "framer-motion";
interface CollectionHeroProps {
  title: string;
  subtitle: string;
  description: string;
  image: string;
}
export function CollectionHero({
  title,
  subtitle,
  description,
  image,
}: CollectionHeroProps) {
  return (
    <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
      {}
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/80 via-charcoal-900/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent to-charcoal-900/30" />
      </div>
      {}
      <div className="relative h-full container-luxury flex items-center">
        <div className="max-w-xl pt-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="overline text-gold-400 mb-4"
          >
            {subtitle}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-6"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-cream-200 text-lg leading-relaxed"
          >
            {description}
          </motion.p>
        </div>
      </div>
    </section>
  );
}