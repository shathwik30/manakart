"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, itemCount, isLoading, fetchCart, updateItem, removeItem } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const isEmpty = items.length === 0;

  return (
    <>
      <Header />
      <main className="min-h-screen py-6 bg-[#f1f3f6]">
        <div className="max-w-[1200px] mx-auto px-4">
          {isEmpty ? (
            /* Empty cart state */
            <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <ShoppingCart className="w-20 h-20 text-gray-300" />
              </div>
              <div>
                <h1 className="text-[28px] font-semibold mb-1 text-gray-900">
                  Your ManaKart Cart is empty
                </h1>
                <p className="text-sm mb-4 text-gray-500">
                  Check your Saved for later items below or{" "}
                  <Link href="/products" className="text-green-600 hover:underline">
                    continue shopping
                  </Link>.
                </p>
                <Link
                  href="/products"
                  className="inline-block px-5 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Cart items - left */}
              <div className="flex-1">
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <h1 className="text-[28px] font-semibold pb-1 text-gray-900">
                    Shopping Cart
                  </h1>
                  <div className="text-right text-sm pb-2 text-gray-500">
                    Price
                  </div>
                  <div className="border-t border-gray-200" />

                  {/* Items */}
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 py-4 border-b border-gray-200"
                    >
                      {/* Product image */}
                      <Link
                        href={`/product/${item.product?.slug || item.product?.id}`}
                        className="relative w-[180px] h-[180px] flex-shrink-0 bg-white rounded-lg overflow-hidden"
                      >
                        {(item.variant?.images?.[0] || item.product?.images?.[0]) ? (
                          <Image
                            src={item.variant?.images?.[0] || item.product.images[0]}
                            alt={item.product.title}
                            fill
                            className="object-contain p-2"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <ShoppingCart className="w-10 h-10 text-gray-300" />
                          </div>
                        )}
                      </Link>

                      {/* Product info - middle */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.product?.slug || item.product?.id}`}
                          className="text-base leading-tight hover:underline line-clamp-2 text-gray-900"
                        >
                          {item.product?.title}
                        </Link>

                        {item.variant && (item.variant.optionValues as any[])?.length > 0 && (
                          <p className="text-xs mt-0.5 text-gray-500">
                            {(item.variant.optionValues as any[]).map((ov: any) => `${ov.optionName}: ${ov.valueName}`).join(", ")}
                          </p>
                        )}

                        {item.product?.stock && item.product.stock > 0 ? (
                          <p className="text-xs mt-1 text-emerald-600">
                            In Stock
                          </p>
                        ) : (
                          <p className="text-xs mt-1 text-red-600">
                            Out of Stock
                          </p>
                        )}

                        {/* Quantity and actions row */}
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          {/* Quantity dropdown */}
                          <div className="flex items-center">
                            <label className="text-xs mr-1 text-gray-500">
                              Qty:
                            </label>
                            <select
                              value={item.quantity}
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value, 10);
                                if (newQty === 0) {
                                  removeItem(item.id);
                                } else {
                                  updateItem(item.id, { quantity: newQty });
                                }
                              }}
                              disabled={isLoading}
                              className="text-xs px-2 py-1 rounded-md cursor-pointer disabled:opacity-50 bg-gray-100 border border-gray-200 text-gray-900 shadow-sm"
                            >
                              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                <option key={n} value={n}>
                                  {n === 0 ? "0 (Delete)" : n}
                                </option>
                              ))}
                            </select>
                          </div>

                          <span className="text-gray-200">|</span>

                          {/* Delete link */}
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={isLoading}
                            className="text-xs text-green-600 hover:underline disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Price - right */}
                      <div className="text-right flex-shrink-0">
                        <span className="text-base font-semibold text-gray-900">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Subtotal at bottom of card */}
                  <div className="text-right pt-3 pb-1">
                    <span className="text-lg text-gray-900">
                      Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}):{" "}
                      <span className="font-semibold">{formatPrice(subtotal)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Sidebar - right */}
              <div className="lg:w-[300px] flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm p-5 sticky top-[110px]">
                  <p className="text-sm mb-1 text-emerald-600">
                    Your order is eligible for FREE Delivery.
                  </p>
                  <p className="text-lg mb-4 text-gray-900">
                    Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}):{" "}
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </p>
                  <Link
                    href="/checkout"
                    className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#fb641b] text-white hover:bg-[#e65100] transition-colors"
                  >
                    Proceed to Buy
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
