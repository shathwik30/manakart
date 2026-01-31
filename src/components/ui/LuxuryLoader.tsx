"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
interface LuxuryLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}
/**
 * Luxury animated loader
 * Displays an elegant loading animation
 */
export function LuxuryLoader({
  className,
  size = "md",
  fullScreen = false,
}: LuxuryLoaderProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };
  const dotSize = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };
  const LoaderContent = (
    <div className={cn("relative", sizes[size])}>
      {/* Rotating circle */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-gold-400/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      {/* Inner rotating dots */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className={cn(
                "absolute rounded-full bg-gold-500",
                dotSize[size]
              )}
              style={{
                top: "50%",
                left: "50%",
                marginTop: `-${size === "sm" ? 4 : size === "md" ? 6 : 8}px`,
                marginLeft: `-${size === "sm" ? 4 : size === "md" ? 6 : 8}px`,
              }}
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
      {/* Center pulse */}
      <motion.div
        className={cn(
          "absolute inset-0 m-auto rounded-full bg-gold-500",
          size === "sm" ? "w-1 h-1" : size === "md" ? "w-1.5 h-1.5" : "w-2 h-2"
        )}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-cream-100",
          className
        )}
      >
        <div className="flex flex-col items-center gap-6">
          {LoaderContent}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-medium text-charcoal-600 tracking-wider uppercase"
          >
            Loading...
          </motion.p>
        </div>
      </motion.div>
    );
  }
  return <div className={className}>{LoaderContent}</div>;
}
/**
 * Simple spinner loader (lightweight alternative)
 */
export function Spinner({ className, size = "md" }: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  };
  return (
    <motion.div
      className={cn(
        "rounded-full border-gold-500 border-t-transparent",
        sizes[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  );
}
