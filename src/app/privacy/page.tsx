import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | ManaKart",
  description: "ManaKart's privacy policy - how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f1f3f6] pt-4">
        <div className="max-w-[900px] mx-auto px-4 pb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-10">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Privacy Policy
            </h1>

            <div className="space-y-8">
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Information We Collect
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We collect information you provide when creating an account,
                  placing orders, or contacting us. This includes your name,
                  email address, phone number, delivery address, and payment
                  information (processed securely via Razorpay).
                </p>
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  How We Use Your Information
                </h2>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-900 mt-0.5">&#8226;</span>
                    Processing and delivering your orders.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-900 mt-0.5">&#8226;</span>
                    Sending order confirmations and shipping updates.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-900 mt-0.5">&#8226;</span>
                    Improving our products, services, and user experience.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-900 mt-0.5">&#8226;</span>
                    Responding to your inquiries and providing customer support.
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Data Security
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We implement industry-standard security measures to protect
                  your personal information. Payment data is handled by our
                  PCI-DSS compliant payment processor and is never stored on our
                  servers.
                </p>
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Cookies
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We use cookies and similar technologies to maintain your
                  session, remember your preferences, and improve our services.
                  You can manage cookie preferences through your browser
                  settings.
                </p>
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Contact Us
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  If you have questions about this privacy policy, contact us at
                  support@manakart.com.
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
