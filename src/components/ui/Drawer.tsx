"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/hooks";
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "left" | "right";
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  className?: string;
}
export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = "right",
  size = "md",
  showCloseButton = true,
  className,
}: DrawerProps) {
  useScrollLock(isOpen);
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);
  const sizes = {
    sm: "max-w-xs",
    md: "max-w-sm",
    lg: "max-w-md",
    xl: "max-w-lg",
  };
  const slideVariants = {
    left: {
      initial: { x: "-100%" },
      animate: { x: 0 },
      exit: { x: "-100%" },
    },
    right: {
      initial: { x: "100%" },
      animate: { x: 0 },
      exit: { x: "100%" },
    },
  };
  if (typeof window === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm"
          />
          {}
          <motion.div
            initial={slideVariants[side].initial}
            animate={slideVariants[side].animate}
            exit={slideVariants[side].exit}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative w-full h-full bg-white shadow-elegant flex flex-col",
              sizes[size],
              side === "right" && "ml-auto",
              className
            )}
          >
            {}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-charcoal-100">
                {title && (
                  <h2 className="text-lg font-display font-medium text-charcoal-900">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 -m-2 text-charcoal-400 hover:text-charcoal-600 transition-colors rounded-full hover:bg-charcoal-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            {}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}