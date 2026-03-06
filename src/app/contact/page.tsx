import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/contact/ContactForm";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | ManaKart",
  description: "Get in touch with ManaKart. We'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f1f3f6] pt-4">
        <div className="max-w-[1100px] mx-auto px-4 pb-8">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 mb-4">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Contact Us
            </h1>
            <p className="text-sm text-gray-500">
              We&apos;d love to hear from you. Whether you have a question about
              products, orders, or anything else, our team is ready to help.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {/* Contact Info */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Email</h3>
                    <a
                      href="mailto:hello@manakart.com"
                      className="text-sm text-green-600 hover:text-green-700 hover:underline"
                    >
                      hello@manakart.com
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Phone</h3>
                    <a
                      href="tel:+911234567890"
                      className="text-sm text-green-600 hover:text-green-700 hover:underline"
                    >
                      +91 123 456 7890
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Visit Us</h3>
                    <p className="text-sm text-gray-500">
                      123 Commerce Street,
                      <br />
                      Mumbai, Maharashtra 400001
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Hours</h3>
                    <p className="text-sm text-gray-500">
                      Mon - Sat: 10:00 AM - 8:00 PM
                      <br />
                      Sunday: 11:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
