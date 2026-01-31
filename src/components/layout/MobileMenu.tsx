"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/hooks";
import { useAuthStore } from "@/store/useAuthStore";
interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: NavItem[];
}
export function MobileMenu({ isOpen, onClose, navigation }: MobileMenuProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  useScrollLock(isOpen);
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-charcoal-900/60 backdrop-blur-sm lg:hidden"
          />
          {}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 bottom-0 z-[101] w-full max-w-sm bg-cream-100 shadow-elegant lg:hidden"
          >
            {}
            <div className="flex items-center justify-between p-6 border-b border-charcoal-100">
              <h2 className="font-display text-xl text-charcoal-900">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 -m-2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {}
            <nav className="flex-1 overflow-y-auto py-4">
              {navigation.map((item) => (
                <div key={item.label} className="border-b border-charcoal-100">
                  {item.children ? (
                    <>
                      <button
                        onClick={() =>
                          setExpandedItem(
                            expandedItem === item.label ? null : item.label
                          )
                        }
                        className="flex items-center justify-between w-full px-6 py-4 text-left"
                      >
                        <span className="text-lg font-medium text-charcoal-900">
                          {item.label}
                        </span>
                        <ChevronRight
                          className={cn(
                            "w-5 h-5 text-charcoal-400 transition-transform duration-200",
                            expandedItem === item.label && "rotate-90"
                          )}
                        />
                      </button>
                      <AnimatePresence>
                        {expandedItem === item.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden bg-cream-200/50"
                          >
                            {item.children.map((child) => (
                              <Link
                                key={child.label}
                                href={child.href}
                                onClick={onClose}
                                className="block px-10 py-3 text-charcoal-700 hover:text-charcoal-900 transition-colors"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="block px-6 py-4 text-lg font-medium text-charcoal-900 hover:bg-cream-200/50 transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
            {}
            <div className="p-6 border-t border-charcoal-100 space-y-3">
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                onClick={onClose}
                className="flex items-center gap-3 w-full px-4 py-3 text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-200/50 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
                <span>{isAuthenticated ? "My Account" : "Sign In"}</span>
              </Link>
              <button className="flex items-center gap-3 w-full px-4 py-3 text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-200/50 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}