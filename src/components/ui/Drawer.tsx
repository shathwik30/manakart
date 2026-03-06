"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  useScrollLock(isOpen);
  useEffect(() => {
    setMounted(true);
  }, []);
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
  if (!mounted || !isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        className={cn(
          "relative w-full h-full bg-white shadow-xl flex flex-col",
          sizes[size],
          side === "right" && "ml-auto",
          className
        )}
        style={{
          transition: "transform 0.2s ease-out",
        }}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {title && (
              <h2 className="text-base font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}
