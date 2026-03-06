import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Shipping & Delivery | ManaKart",
  description: "Learn about ManaKart's shipping and delivery policies.",
};

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f1f3f6] pt-4">
        <div className="max-w-[900px] mx-auto px-4 pb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-10">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Shipping & Delivery
            </h1>

            <div className="space-y-8">
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Delivery Timelines
                </h2>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-200">
                        <th className="px-4 py-3 text-gray-900 font-semibold">Location</th>
                        <th className="px-4 py-3 text-gray-900 font-semibold">Standard Delivery</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-500">
                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-2.5">Metro Cities</td>
                        <td className="px-4 py-2.5">3-4 business days</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-2.5">Tier 2 Cities</td>
                        <td className="px-4 py-2.5">4-6 business days</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5">Other Areas</td>
                        <td className="px-4 py-2.5">5-7 business days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Shipping Charges
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We offer free standard shipping on all orders above Rs 499.
                  For orders below Rs 499, a flat delivery fee of Rs 49 applies.
                  Shipping charges, if any, are shown at checkout before payment.
                </p>
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Order Tracking
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Once your order is shipped, you can track its status from your
                  Account &gt; Orders page. You will also receive email
                  notifications at each stage of delivery.
                </p>
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Delivery Issues
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  If your order is delayed or you face any delivery issues,
                  please contact us at support@manakart.com. We will work with
                  our logistics partners to resolve the issue promptly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
