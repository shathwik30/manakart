import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle, Package } from "lucide-react";

export const metadata: Metadata = {
  title: "Order Confirmed | ManaKart",
  description: "Your order has been placed successfully",
};

export default function OrderSuccessPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f1f3f6] pt-4">
        <div className="max-w-[700px] mx-auto px-4 pb-8">
          {/* Success Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center mb-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-semibold text-emerald-600 mb-2">
              Order placed, thank you!
            </h1>
            <p className="text-sm text-gray-500 mb-1">
              Your order has been confirmed and will be shipped shortly.
            </p>
            <p className="text-sm text-gray-500">
              We&apos;ve sent a confirmation email with all the details.
            </p>
          </div>

          {/* Order Progress */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-4">
            <div className="flex items-center gap-3 mb-5">
              <Package className="w-5 h-5 text-gray-800" />
              <h2 className="text-sm font-semibold text-gray-900">
                What&apos;s next?
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Order Confirmed</p>
                  <p className="text-xs text-gray-500">
                    Your order has been received
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-gray-500 font-semibold">2</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Processing</p>
                  <p className="text-xs text-gray-400">
                    We&apos;re preparing your items
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-gray-500 font-semibold">3</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Shipped</p>
                  <p className="text-xs text-gray-400">
                    Your order is on its way
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center px-6 py-2 text-sm bg-gray-900 rounded-lg text-white hover:bg-gray-800 transition-colors"
            >
              View your orders
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
