"use client";
import { useEffect, useRef, useState } from "react";
/**
 * Luxury scroll reveal animation hook
 * Reveals elements elegantly on scroll with Intersection Observer
 */
export function useScrollReveal(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
        ...options,
      }
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [options]);
  return { ref, isVisible };
}
/**
 * Stagger children animation
 * Returns delay for each child element
 */
export function useStaggerAnimation(index: number, baseDelay = 100) {
  return index * baseDelay;
}
/**
 * Magnetic button effect hook
 * Creates subtle magnetic cursor follow effect on hover
 */
export function useMagneticEffect(strength = 0.3) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      element.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };
    const handleMouseLeave = () => {
      element.style.transform = "translate(0, 0)";
    };
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength]);
  return ref;
}
/**
 * Parallax scroll effect
 * Creates subtle depth on scroll
 */
export function useParallax(speed = 0.5) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrolled;
      const offset = (scrolled - elementTop) * speed;
      element.style.transform = `translateY(${offset}px)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [speed]);
  return ref;
}
/**
 * Smooth counter animation
 * Animates numbers from 0 to target
 */
export function useCountAnimation(
  target: number,
  duration = 2000,
  isVisible = true
) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    const startTime = Date.now();
    const endTime = startTime + duration;
    const timer = setInterval(() => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(target * easeProgress));
      if (now >= endTime) {
        setCount(target);
        clearInterval(timer);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, isVisible]);
  return count;
}
