"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { HeroContent } from "@/lib/api";

interface HeroProps {
  slides: HeroContent[];
}

export function Hero({ slides }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrev = () => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    goToSlide((currentSlide + 1) % slides.length);
  };

  if (slides.length === 0) {
    return (
      <section className="relative h-screen bg-charcoal-900 flex items-center justify-center">
        <div className="text-center text-cream-100">
          <h1 className="font-display text-4xl md:text-6xl mb-4">
            Succession
          </h1>
          <p className="text-lg text-charcoal-300">
            Timeless elegance awaits
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-screen overflow-hidden -mt-20">
      {}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {}
          <div className="absolute inset-0">
            <Image
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              fill
              priority
              className="object-cover"
            />
            {}
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/70 via-charcoal-900/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/50 via-transparent to-charcoal-900/30" />
          </div>

          {}
          <div className="relative h-full container-luxury flex items-center">
            <div className="max-w-2xl pt-20">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="overline text-gold-400 mb-6"
              >
                New Collection
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white mb-6 leading-tight"
              >
                {slides[currentSlide].title}
              </motion.h1>

              {slides[currentSlide].subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-lg md:text-xl text-cream-200 mb-10 max-w-lg leading-relaxed"
                >
                  {slides[currentSlide].subtitle}
                </motion.p>
              )}

              {slides[currentSlide].ctaText && slides[currentSlide].ctaLink && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <Link href={slides[currentSlide].ctaLink!}>
                    <Button
                      variant="secondary"
                      size="lg"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                      className="border-white text-white hover:bg-white hover:text-charcoal-900"
                    >
                      {slides[currentSlide].ctaText}
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {}
      {slides.length > 1 && (
        <>
          <motion.button
            onClick={goToPrev}
            className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full backdrop-blur-md bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all z-10 group"
            whileHover={{ scale: 1.1, x: -4 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 group-hover:animate-pulse" />
          </motion.button>
          <motion.button
            onClick={goToNext}
            className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full backdrop-blur-md bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all z-10 group"
            whileHover={{ scale: 1.1, x: 4 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 group-hover:animate-pulse" />
          </motion.button>
        </>
      )}

      {}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10 backdrop-blur-sm bg-white/5 px-4 py-3 rounded-full border border-white/10">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500 relative",
                index === currentSlide
                  ? "w-10 bg-white"
                  : "w-1.5 bg-white/40 hover:bg-white/60"
              )}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === currentSlide && (
                <motion.div
                  layoutId="activeSlide"
                  className="absolute inset-0 bg-white rounded-full"
                  initial={false}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </motion.button>
          ))}
        </div>
      )}

      {}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 right-8 hidden lg:flex flex-col items-center gap-2 text-white/60"
      >
        <span className="text-xs tracking-widest uppercase vertical-rl transform rotate-180">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}