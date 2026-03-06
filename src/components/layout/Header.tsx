"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Search,
  ShoppingCart,
  ChevronDown,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { CartDrawer } from "@/components/common/CartDrawer";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { itemCount, isOpen: isCartOpen, openCart, closeCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { navCategories, fetchNavCategories } = useCategoryStore();

  useEffect(() => {
    fetchNavCategories();
  }, [fetchNavCategories]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const categoryParam =
        selectedCategory !== "all" ? `&category=${selectedCategory}` : "";
      router.push(
        `/search?q=${encodeURIComponent(searchQuery.trim())}${categoryParam}`
      );
      setSearchQuery("");
    }
  };

  const userName = user?.name?.split(" ")[0] || "";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Row 1 - Main header bar (dark navy) */}
        <div className="bg-[#232f3e]">
          <div className="max-w-[1280px] mx-auto px-4 md:px-6 flex items-center gap-4 h-[60px]">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0"
            >
              <Image
                src="/logo.png"
                alt="ManaKart"
                width={130}
                height={45}
                className="h-[38px] w-auto object-contain"
                priority
              />
            </Link>

            {/* Search bar - Desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 mx-4"
            >
              <div className="flex w-full max-w-2xl">
                {/* Category dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() =>
                      setShowCategoryDropdown(!showCategoryDropdown)
                    }
                    className="flex items-center gap-1 h-[38px] px-3 text-[13px] text-gray-700 whitespace-nowrap bg-gray-100 border border-gray-300 border-r-0 rounded-l-md hover:bg-gray-200 transition-colors"
                  >
                    {selectedCategory === "all"
                      ? "All"
                      : navCategories.find((c) => c.slug === selectedCategory)
                          ?.name || "All"}
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  </button>
                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px] z-50 max-h-[400px] overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory("all");
                          setShowCategoryDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        All Categories
                      </button>
                      {navCategories.map((cat) => (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.slug);
                            setShowCategoryDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-green-50 hover:text-green-700 transition-colors"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search input */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands and more"
                  className="flex-1 h-[38px] px-4 text-sm text-gray-900 bg-white border-y border-gray-300 focus:outline-none focus:ring-0 transition-all"
                />

                {/* Search button */}
                <button
                  type="submit"
                  className="h-[38px] w-[44px] flex items-center justify-center bg-[#388e3c] text-white rounded-r-md hover:bg-[#2e7d32] transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Right side actions */}
            <div className="flex items-center gap-1">
              {/* Account */}
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] text-gray-400">
                    {isAuthenticated ? `Hi, ${userName}` : "Sign in"}
                  </span>
                  <span className="text-sm font-medium text-white">
                    Account
                  </span>
                </div>
              </Link>

              {/* Orders */}
              <Link
                href={isAuthenticated ? "/account/orders" : "/login"}
                className="hidden md:flex items-center px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] text-gray-400">Returns</span>
                  <span className="text-sm font-medium text-white">& Orders</span>
                </div>
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative flex items-center gap-1.5 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Cart"
              >
                <div className="relative">
                  <ShoppingCart className="w-6 h-6" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-[#f0c14b] text-[#232f3e] text-[11px] font-bold rounded-full px-1">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-white hidden sm:inline">
                  Cart
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden px-3 py-2 bg-[#232f3e] border-b border-[#3a4553]">
          <form onSubmit={handleSearch} className="flex rounded-md overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 h-[38px] px-3 text-sm text-gray-900 bg-white focus:outline-none"
            />
            <button
              type="submit"
              className="h-[38px] w-[42px] flex items-center justify-center bg-[#388e3c] text-white"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Row 2 - Navigation bar (green) */}
        <div className="bg-[#388e3c]">
          <div className="max-w-[1280px] mx-auto px-4 md:px-6">
            {/* Desktop nav */}
            <div className="hidden lg:flex items-center h-[38px] gap-0.5 text-sm overflow-x-auto">
              {/* All button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 font-medium text-white hover:bg-white/15 rounded whitespace-nowrap transition-colors"
              >
                <Menu className="w-4 h-4" />
                All
              </button>

              {/* Category links */}
              {navCategories.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className={cn(
                    "px-3 py-1 rounded whitespace-nowrap transition-colors text-white",
                    pathname === `/category/${cat.slug}`
                      ? "font-bold bg-white/20"
                      : "hover:bg-white/15"
                  )}
                >
                  {cat.name}
                </Link>
              ))}

              {/* Today's Deals */}
              <Link
                href="/search?deals=true"
                className="px-3 py-1 text-white hover:bg-white/15 rounded whitespace-nowrap transition-colors"
              >
                Today&apos;s Deals
              </Link>

              {/* Help */}
              <Link
                href="/help"
                className="px-3 py-1 text-white hover:bg-white/15 rounded whitespace-nowrap transition-colors"
              >
                Help
              </Link>
            </div>

            {/* Mobile category pills */}
            <div className="lg:hidden flex items-center gap-2 h-[36px] overflow-x-auto no-scrollbar">
              {navCategories.slice(0, 10).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className={cn(
                    "text-[13px] whitespace-nowrap px-3 py-1 rounded transition-colors text-white",
                    pathname === `/category/${cat.slug}`
                      ? "font-bold bg-white/20"
                      : "hover:bg-white/15"
                  )}
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/search?deals=true"
                className="text-[13px] text-white whitespace-nowrap px-3 py-1 rounded hover:bg-white/15 transition-colors"
              >
                Deals
              </Link>
              <Link
                href="/help"
                className="text-[13px] text-white whitespace-nowrap px-3 py-1 rounded hover:bg-white/15 transition-colors"
              >
                Help
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer - accounts for fixed header height */}
      <div className="h-[98px] md:h-[98px] lg:h-[98px]" />

      {/* Mobile menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Cart drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
}
