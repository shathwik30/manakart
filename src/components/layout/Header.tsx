"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ShoppingBag,
  User,
  ChevronDown,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { CartDrawer } from "@/components/common/CartDrawer";
import { MobileMenu } from "./MobileMenu";

const navigation = [
  {
    label: "Collections",
    href: "/collections",
    children: [
      { label: "Gentlemen", href: "/collections/gentlemen" },
      { label: "Lady", href: "/collections/lady" },
      { label: "Couple", href: "/collections/couple" },
    ],
  },
  { label: "About", href: "/about" },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const { itemCount, isOpen: isCartOpen, openCart, closeCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowBanner(window.scrollY < 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isHomePage = pathname === "/";
  const shouldBeTransparent = isHomePage && !isScrolled;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          shouldBeTransparent
            ? "bg-transparent"
            : "bg-cream-100/95 backdrop-blur-md shadow-soft-sm"
        )}
      >
        {}
        <AnimatePresence>
          {showBanner && (
            <motion.div
              className="sticky top-0 z-40 h-10 bg-charcoal-800 flex items-center justify-center overflow-hidden"
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-charcoal-200 text-sm tracking-wider font-medium">
                Delivered with Distinction
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {}
        <div className="container-luxury">
          <div className="flex items-center justify-between h-20">
            {}
            <div className="flex items-center gap-4 lg:gap-6 flex-1">
              {}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={cn(
                  "lg:hidden p-2 -ml-2 transition-colors",
                  shouldBeTransparent
                    ? "text-white hover:text-white/80"
                    : "text-charcoal-900 hover:text-charcoal-600"
                )}
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              {}
              <nav className="hidden lg:flex items-center gap-8">
                {navigation.map((item) => (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() =>
                      item.children && setActiveDropdown(item.label)
                    }
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-1 text-sm font-medium tracking-wide transition-colors py-2",
                        shouldBeTransparent
                          ? "text-white hover:text-white/80"
                          : "text-charcoal-700 hover:text-charcoal-900",
                        pathname.startsWith(item.href) &&
                          (shouldBeTransparent
                            ? "text-white"
                            : "text-charcoal-900")
                      )}
                    >
                      {item.label}
                      {item.children && (
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            activeDropdown === item.label && "rotate-180"
                          )}
                        />
                      )}
                    </Link>

                    {}
                    {item.children && (
                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute top-full left-0 pt-2"
                          >
                            <motion.div
                              initial={{ scale: 0.95 }}
                              animate={{ scale: 1 }}
                              className="backdrop-luxury rounded-xl shadow-elegant border border-charcoal-900/5 p-2 min-w-[200px]"
                            >
                              {item.children.map((child, idx) => (
                                <motion.div
                                  key={child.label}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05, duration: 0.2 }}
                                >
                                  <Link
                                    href={child.href}
                                    className="group block px-4 py-3 text-sm text-charcoal-700 hover:text-gold-600 hover:bg-cream-100 rounded-lg transition-all relative overflow-hidden"
                                  >
                                    <span className="relative z-10">{child.label}</span>
                                    <motion.div
                                      className="absolute inset-0 bg-gold-50"
                                      initial={{ x: "-100%" }}
                                      whileHover={{ x: 0 }}
                                      transition={{ duration: 0.3 }}
                                    />
                                  </Link>
                                </motion.div>
                              ))}
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:flex-1 lg:flex lg:justify-center"
            >
              <h1
                className={cn(
                  "font-display text-2xl lg:text-3xl tracking-wide transition-colors",
                  shouldBeTransparent ? "text-white" : "text-charcoal-900"
                )}
              >
                Succession
              </h1>
            </Link>

            {}
            <div className="flex items-center gap-2 lg:gap-4 flex-1 justify-end">
              {}
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                className={cn(
                  "hidden lg:flex p-2 transition-colors rounded-lg",
                  shouldBeTransparent
                    ? "text-white hover:text-white/80 hover:bg-white/10"
                    : "text-charcoal-700 hover:text-charcoal-900 hover:bg-charcoal-100"
                )}
                aria-label="Account"
              >
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                  <User className="w-5 h-5" />
                </motion.div>
              </Link>

              {}
              <motion.button
                onClick={openCart}
                className={cn(
                  "relative p-2 transition-colors rounded-lg",
                  shouldBeTransparent
                    ? "text-white hover:text-white/80 hover:bg-white/10"
                    : "text-charcoal-700 hover:text-charcoal-900 hover:bg-charcoal-100"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Shopping bag"
              >
                <ShoppingBag className="w-5 h-5" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-gold-500 text-white text-xs font-medium rounded-full shadow-[0_4px_12px_-2px_rgba(192,88,0,0.4)]"
                    >
                      <motion.span
                        key={itemCount}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {itemCount > 9 ? "9+" : itemCount}
                      </motion.span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {}
      <div className={cn("h-20", !isHomePage && "mt-10")} />

      {}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigation={navigation}
      />

      {}
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
}