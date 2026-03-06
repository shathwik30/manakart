"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { X, ChevronRight, User, Package, Settings, HelpCircle } from "lucide-react";
import { useScrollLock } from "@/hooks";
import { useAuthStore } from "@/store/useAuthStore";
import { useCategoryStore } from "@/store/useCategoryStore";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { navCategories } = useCategoryStore();
  const { isAuthenticated, user } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const userName = user?.name || "Guest";

  if (!isVisible) return null;

  return (
    <div className="lg:hidden">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[100] transition-opacity duration-300"
        style={{
          backgroundColor: "rgba(0,0,0,0.4)",
          opacity: isAnimating ? 1 : 0,
        }}
      />

      {/* Slide-in panel */}
      <div
        className="fixed top-0 left-0 bottom-0 z-[101] w-full max-w-[340px] flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out"
        style={{
          transform: isAnimating ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#232f3e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#3a4553]">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-semibold text-white">
              Hello, {isAuthenticated ? userName : "Sign in"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-[#3a4553] rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <nav className="flex-1 overflow-y-auto">
          {/* Shop by Category section */}
          <div className="border-b border-gray-100">
            <h3 className="px-5 pt-5 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Shop By Category
            </h3>
            {navCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                onClick={onClose}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-900">{cat.name}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
            <Link
              href="/products"
              onClick={onClose}
              className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-green-600">
                See All Products
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>

          {/* Deals section */}
          <div className="border-b border-gray-100">
            <h3 className="px-5 pt-5 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Trending
            </h3>
            <Link
              href="/search?deals=true"
              onClick={onClose}
              className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-900">
                Today&apos;s Deals
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>

          {/* Help & Settings section */}
          <div className="border-b border-gray-100">
            <h3 className="px-5 pt-5 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Help & Settings
            </h3>

            <Link
              href={isAuthenticated ? "/account" : "/login"}
              onClick={onClose}
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
            >
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-900">
                {isAuthenticated ? "Your Account" : "Sign In"}
              </span>
            </Link>

            {isAuthenticated && (
              <Link
                href="/account/orders"
                onClick={onClose}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <Package className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-900">Your Orders</span>
              </Link>
            )}

            {isAuthenticated && (
              <Link
                href="/account/addresses"
                onClick={onClose}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-900">Addresses</span>
              </Link>
            )}

            <Link
              href="/help"
              onClick={onClose}
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-900">Help</span>
            </Link>
          </div>

          {/* About links */}
          <div className="pb-4">
            <Link
              href="/about"
              onClick={onClose}
              className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-900">About ManaKart</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              href="/contact"
              onClick={onClose}
              className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-900">Contact Us</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
