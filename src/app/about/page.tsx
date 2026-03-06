import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ShoppingBag, Truck, Shield, Headphones } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | ManaKart",
  description: "Learn about ManaKart - your one-stop online marketplace for everything.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f1f3f6] pt-4">
        <div className="max-w-[900px] mx-auto px-4 pb-8">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-10">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              About ManaKart
            </h1>

            <div className="space-y-4 text-sm text-gray-900 leading-relaxed">
              <p>
                ManaKart was built with a simple mission: to make online shopping
                easy, affordable, and accessible for everyone. We connect buyers
                with sellers across the country, offering everything from
                electronics and fashion to home essentials and more.
              </p>
              <p>
                With a focus on customer satisfaction, we ensure every purchase
                is backed by secure payments, reliable shipping, and hassle-free
                returns. Our platform is designed to help you find exactly what
                you need at the best possible price.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-8" />

            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Why Shop with Us
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: ShoppingBag,
                  title: "Huge Selection",
                  description:
                    "Browse millions of products across hundreds of categories from trusted sellers.",
                },
                {
                  icon: Truck,
                  title: "Fast Delivery",
                  description:
                    "Get your orders delivered quickly with our reliable logistics network across India.",
                },
                {
                  icon: Shield,
                  title: "Secure Payments",
                  description:
                    "Shop confidently with our secure payment gateway supporting cards, UPI, and net banking.",
                },
                {
                  icon: Headphones,
                  title: "24/7 Support",
                  description:
                    "Our dedicated customer support team is always here to help you with any questions.",
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-gray-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-8" />

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                Discover great deals and new arrivals every day.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-2 text-sm bg-gray-900 rounded-lg text-white hover:bg-gray-800 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
