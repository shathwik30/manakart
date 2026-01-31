"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { Drawer, Button, Divider } from "@/components/ui";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils";
interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}
export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, subtotal, isLoading, updateItem, removeItem } = useCartStore();
  const isEmpty = items.length === 0;
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Shopping Bag" size="md">
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-full py-20 px-6">
          <div className="w-20 h-20 rounded-full bg-cream-200 flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-charcoal-400" />
          </div>
          <h3 className="font-display text-xl text-charcoal-900 mb-2">
            Your Collection Awaits
          </h3>
          <p className="text-charcoal-500 text-center mb-8">
            Explore our carefully curated selections to discover your signature style.
          </p>
          <Button onClick={onClose} variant="primary">
            Explore Collections
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  {}
                  <div className="relative w-24 h-32 bg-cream-200 rounded-lg overflow-hidden flex-shrink-0">
                    {item.type === "outfit" && item.outfit?.heroImages[0] ? (
                      <Image
                        src={item.outfit.heroImages[0]}
                        alt={item.outfit.title}
                        fill
                        className="object-cover"
                      />
                    ) : item.type === "product" && item.product?.images[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-charcoal-300" />
                      </div>
                    )}
                  </div>
                  {}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-charcoal-900 truncate">
                      {item.type === "outfit"
                        ? item.outfit?.title
                        : item.product?.title}
                    </h4>
                    {}
                    <div className="mt-1 text-sm text-charcoal-500">
                      {item.type === "outfit" ? (
                        <span>Complete Outfit</span>
                      ) : (
                        <span>Size: {item.selectedSizes.size}</span>
                      )}
                    </div>
                    {}
                    <p className="mt-2 font-serif text-lg text-charcoal-900">
                      {formatPrice(item.price)}
                    </p>
                    {}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-charcoal-200 rounded-lg">
                        <button
                          onClick={() =>
                            item.quantity > 1
                              ? updateItem(item.id, { quantity: item.quantity - 1 })
                              : removeItem(item.id)
                          }
                          disabled={isLoading}
                          className="p-2 text-charcoal-500 hover:text-charcoal-900 transition-colors disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 text-sm font-medium text-charcoal-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateItem(item.id, { quantity: item.quantity + 1 })
                          }
                          disabled={isLoading}
                          className="p-2 text-charcoal-500 hover:text-charcoal-900 transition-colors disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={isLoading}
                        className="p-2 text-charcoal-400 hover:text-burgundy-500 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          {}
          <div className="border-t border-charcoal-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-charcoal-600">Subtotal</span>
              <span className="font-serif text-xl text-charcoal-900">
                {formatPrice(subtotal)}
              </span>
            </div>
            <motion.div
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gold-50 border border-gold-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Truck className="w-4 h-4 text-gold-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gold-700">
                Delivered with Distinction
              </span>
            </motion.div>
            <div className="space-y-3">
              <Link href="/checkout" onClick={onClose}>
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Checkout
                </Button>
              </Link>
              <Button variant="ghost" fullWidth onClick={onClose}>
                Explore More
              </Button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}