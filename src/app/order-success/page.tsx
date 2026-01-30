import { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your order has been placed successfully",
};

export default function OrderSuccessPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen pt-32 pb-20 bg-cream-100">
        <div className="container-luxury">
          <div className="max-w-lg mx-auto text-center">
            {}
            <div className="w-24 h-24 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-12 h-12 text-gold-600" />
            </div>

            <h1 className="font-display text-3xl md:text-4xl text-charcoal-900 mb-4">
              Thank You for Your Order
            </h1>

            <p className="text-charcoal-600 text-lg mb-8">
              Your order has been confirmed and will be shipped shortly. We&apos;ve
              sent a confirmation email with all the details.
            </p>

            {}
            <div className="bg-white rounded-2xl p-8 shadow-soft-md mb-8 text-left">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-cream-200 flex items-center justify-center">
                  <Package className="w-6 h-6 text-charcoal-600" />
                </div>
                <div>
                  <p className="text-sm text-charcoal-500">What&apos;s next?</p>
                  <p className="font-medium text-charcoal-900">
                    We&apos;re preparing your order
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-900">Order Confirmed</p>
                    <p className="text-sm text-charcoal-500">
                      Your order has been received
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-charcoal-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-charcoal-500">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500">Processing</p>
                    <p className="text-sm text-charcoal-400">
                      We&apos;re preparing your items
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-charcoal-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-charcoal-500">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500">Shipped</p>
                    <p className="text-sm text-charcoal-400">
                      Your order is on its way
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/account/orders">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  View Order
                </Button>
              </Link>

              <Link href="/collections">
                <Button variant="secondary" size="lg">
                  Explore More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}