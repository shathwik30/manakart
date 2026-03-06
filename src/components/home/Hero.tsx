"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroContent } from "@/lib/api";

interface HeroProps {
  slides: HeroContent[];
}

export function Hero({ slides }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentSlide(index);
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 10000);
    },
    []
  );

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [slides.length]);

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  if (slides.length === 0) {
    return (
      <section className="relative h-[200px] md:h-[300px] bg-[#232f3e] flex items-center justify-center">
        <div className="flex flex-col items-center text-white">
          <Image
            src="/logo.png"
            alt="ManaKart"
            width={220}
            height={76}
            className="h-[60px] md:h-[76px] w-auto object-contain brightness-0 invert"
            priority
          />
          <p className="text-sm md:text-base text-gray-300 mt-2">
            Shop everything you need
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[200px] md:h-[300px] overflow-hidden bg-gray-100">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-in-out",
              index === currentSlide ? "opacity-100 z-[2]" : "opacity-0 z-[1]"
            )}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
            />
            {/* CTA overlay */}
            {slide.ctaText && slide.ctaLink && (
              <div className="absolute inset-0 flex items-end justify-center pb-8 z-[3]">
                <Link
                  href={slide.ctaLink}
                  className="px-6 py-2.5 bg-[#388e3c] hover:bg-[#2e7d32] text-white text-sm font-semibold rounded-lg shadow-lg transition-colors"
                >
                  {slide.ctaText}
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-0 top-0 bottom-0 w-12 md:w-16 flex items-center justify-center z-10 hover:bg-black/5 transition-colors group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 text-gray-600 group-hover:text-gray-900 drop-shadow-md" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-0 bottom-0 w-12 md:w-16 flex items-center justify-center z-10 hover:bg-black/5 transition-colors group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-8 h-8 md:w-10 md:h-10 text-gray-600 group-hover:text-gray-900 drop-shadow-md" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "bg-[#388e3c] w-6"
                  : "bg-gray-400 w-2 hover:bg-gray-600"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
