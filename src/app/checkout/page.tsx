import { Metadata } from "next";
import { Header } from "@/components/layout";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your purchase at Succession",
};
export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20 bg-cream-100">
        <div className="container-luxury">
          <CheckoutFlow />
        </div>
      </main>
    </>
  );
}