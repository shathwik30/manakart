import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HelpCircle, Package, CreditCard, Truck, RotateCcw, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Help Center | ManaKart",
  description: "Find answers to common questions about shopping on ManaKart.",
};

const faqs = [
  {
    icon: Package,
    question: "How do I track my order?",
    answer:
      "Go to your Account > Orders to view order status and tracking details. You'll also receive email updates as your order progresses.",
  },
  {
    icon: CreditCard,
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards, UPI, net banking, and Razorpay wallet through our secure payment gateway.",
  },
  {
    icon: Truck,
    question: "How long does delivery take?",
    answer:
      "Standard delivery takes 3-7 business days depending on your location. Metro cities typically receive orders within 3-4 days.",
  },
  {
    icon: RotateCcw,
    question: "How do I return a product?",
    answer:
      "You can initiate a return within 15 days of delivery. Go to Account > Orders, select the order, and click 'Request Return'. We'll arrange a pickup.",
  },
  {
    icon: ShieldCheck,
    question: "Is my payment information secure?",
    answer:
      "Yes. All payments are processed through Razorpay's PCI-DSS compliant payment gateway. We never store your card details on our servers.",
  },
  {
    icon: HelpCircle,
    question: "How do I contact customer support?",
    answer:
      "You can reach us via email at support@manakart.com or call +91 123 456 7890. Our support team is available Monday through Saturday, 9 AM to 6 PM IST.",
  },
];

export default function HelpPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f1f3f6] pt-4">
        <div className="max-w-[900px] mx-auto px-4 pb-8">
          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Help Center
            </h1>
            <p className="text-sm text-gray-500">
              Find answers to frequently asked questions below.
            </p>
          </div>

          {/* FAQ List */}
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-5"
              >
                <div className="flex items-start gap-3">
                  <faq.icon className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
                      {faq.question}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Still need help */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mt-4 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Still need help?
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Our support team is happy to assist you.
            </p>
            <Link
              href="/contact"
              className="inline-block px-6 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
