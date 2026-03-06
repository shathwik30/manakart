import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Returns & Refunds | ManaKart",
  description: "ManaKart's return and refund policy.",
};

export default function ReturnsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f1f3f6] pt-4">
        <div className="max-w-[900px] mx-auto px-4 pb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-10">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Returns & Refunds
            </h1>

            <div className="space-y-8">
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Return Policy
                </h2>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-900 mt-0.5">&#8226;</span>
                    Products can be returned within 15 days of delivery.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-900 mt-0.5">&#8226;</span>
                    Items must be unused, in original packaging with all tags attached.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-900 mt-0.5">&#8226;</span>
                    To initiate a return, go to Account &gt; Orders and select the relevant order.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-900 mt-0.5">&#8226;</span>
                    We will arrange a free pickup from your address.
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Refund Policy
                </h2>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-900 mt-0.5">&#8226;</span>
                    Refunds are processed within 5-7 business days after we receive the returned item.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-900 mt-0.5">&#8226;</span>
                    The refund will be credited to your original payment method.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-900 mt-0.5">&#8226;</span>
                    Shipping charges are non-refundable unless the return is due to a defective or incorrect item.
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Non-Returnable Items
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Certain categories such as perishable goods, personal care
                  items, and customized products may not be eligible for return.
                  This will be clearly mentioned on the product page.
                </p>
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Need Help?
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  For any questions about returns or refunds, please contact us
                  at support@manakart.com or call +91 123 456 7890.
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
