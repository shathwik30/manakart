import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";

export const metadata: Metadata = {
  title: "Checkout - ManaKart",
  description: "Complete your purchase at ManaKart",
};

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-6 bg-[#f1f3f6]">
        <div className="max-w-[1100px] mx-auto px-4">
          <CheckoutFlow />
        </div>
      </main>
      <Footer />
    </>
  );
}
