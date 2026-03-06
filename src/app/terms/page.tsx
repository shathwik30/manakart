import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Service | ManaKart",
  description: "ManaKart's terms and conditions of use.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f1f3f6] pt-4">
        <div className="max-w-[900px] mx-auto px-4 pb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-10">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Terms of Service
            </h1>

            <div className="space-y-8">
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Acceptance of Terms
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  By accessing or using ManaKart, you agree to be bound by these
                  terms. If you do not agree, please do not use our platform.
                </p>
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  User Accounts
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  You are responsible for maintaining the confidentiality of your
                  account. You agree to provide accurate and complete information
                  when creating an account and to update your information as
                  needed.
                </p>
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Orders & Payments
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  All prices are listed in Indian Rupees (INR). We reserve the
                  right to modify prices at any time. Payment must be completed
                  before order processing begins. Orders are subject to product
                  availability.
                </p>
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Product Information
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We strive to display products accurately, but colors and
                  dimensions may vary slightly from what appears on screen. We
                  do not guarantee that product descriptions are error-free or
                  complete.
                </p>
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Limitation of Liability
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  ManaKart shall not be liable for any indirect, incidental, or
                  consequential damages arising from the use of our services.
                  Our maximum liability is limited to the amount paid for the
                  relevant order.
                </p>
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Changes to Terms
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We may update these terms from time to time. Continued use of
                  ManaKart after changes constitutes acceptance of the updated
                  terms. We encourage you to review this page periodically.
                </p>
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Contact
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  For questions about these terms, contact us at
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
