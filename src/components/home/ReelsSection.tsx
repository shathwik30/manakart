"use client";
import { motion } from "framer-motion";
import { ReelsDisplay } from "@/components/reels";
import { Reel } from "@/lib/api";
import { Film, Sparkles } from "lucide-react";
interface ReelsSectionProps {
  reels: Reel[];
}
export function ReelsSection({ reels }: ReelsSectionProps) {
  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-charcoal-900 via-charcoal-800 to-charcoal-900 relative overflow-hidden">
      {/* Elegant background elements */}
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, #C9A227 1px, transparent 1px), linear-gradient(to bottom, #C9A227 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }} />
      </div>
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl" />
      <div className="container-luxury relative">
        {/* Premium Header */}
        <div className="text-center mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-gold-500/20 to-gold-600/20 border border-gold-500/30 shadow-lg backdrop-blur-sm mb-6"
          >
            <Film className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-medium text-gold-300 tracking-wide">
              STYLE IN MOTION
            </span>
            <Sparkles className="w-3 h-3 text-gold-400" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl text-cream-100 mb-6"
          >
            See Our Collections
            <span className="block text-gold-400 mt-2">Come to Life</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg text-cream-200 max-w-3xl mx-auto leading-relaxed"
          >
            Experience the elegance of our designs through curated visual stories.
            Each piece tells a tale of sophistication and timeless style.
          </motion.p>
          {/* Decorative divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="w-24 h-1 mx-auto mt-8 bg-gradient-to-r from-transparent via-gold-500 to-transparent rounded-full shadow-lg shadow-gold-500/50"
          />
        </div>
        {/* Reels Display */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <ReelsDisplay reels={reels} />
        </motion.div>
      </div>
    </section>
  );
}
