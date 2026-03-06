"use client";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, X } from "lucide-react";
import { Drawer } from "@/components/ui";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, subtotal, itemCount, isLoading, removeItem } = useCartStore();
  const isEmpty = items.length === 0;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Shopping Cart" size="md">
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-full py-20 px-6">
          <ShoppingCart className="w-16 h-16 mb-4 text-gray-300" />
          <h3 className="text-lg font-bold mb-1 text-gray-900">
            Your ManaKart Cart is empty
          </h3>
          <p className="text-sm mb-6 text-gray-500">
            Your shopping cart is waiting. Give it purpose — fill it with
            groceries, clothing, household supplies, electronics, and more.
          </p>
          <Link
            href="/products"
            onClick={onClose}
            className="inline-block px-6 py-2 rounded-lg text-sm font-bold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Item list */}
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-4 hover:bg-gray-50 transition-colors">
                  {/* Thumbnail */}
                  <div className="relative w-[72px] h-[72px] bg-white flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                    {(item.variant?.images?.[0] || item.product?.images?.[0]) ? (
                      <Image
                        src={item.variant?.images?.[0] || item.product.images[0]}
                        alt={item.product.title}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-tight line-clamp-2 text-green-600">
                      {item.product?.title}
                    </p>
                    {item.variant && (item.variant.optionValues as any[])?.length > 0 && (
                      <p className="text-xs mt-0.5 text-gray-500">
                        {(item.variant.optionValues as any[]).map((ov: any) => `${ov.optionName}: ${ov.valueName}`).join(", ")}
                      </p>
                    )}
                    <p className="text-sm font-bold mt-1 text-gray-900">
                      {formatPrice(item.price)}
                    </p>
                    <p className="text-xs mt-0.5 text-gray-500">
                      Qty: {item.quantity}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={isLoading}
                      className="text-xs mt-1 text-green-600 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom section */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-base mb-3 text-gray-900">
              Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}):{" "}
              <span className="font-bold">{formatPrice(subtotal)}</span>
            </p>
            <Link
              href="/cart"
              onClick={onClose}
              className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-bold bg-[#fb641b] text-white hover:bg-[#e65100] transition-colors"
            >
              Go to Cart
            </Link>
          </div>
        </div>
      )}
    </Drawer>
  );
}
