import { Metadata } from "next";
import { Header, Footer } from "@/components/layout";
import { ContactForm } from "@/components/contact/ContactForm";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Succession. We'd love to hear from you.",
};
export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="pt-32 pb-20 bg-cream-100">
        <div className="container-luxury">
          <div className="text-center mb-16">
            <p className="overline text-gold-600 mb-4">Get in Touch</p>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal-900 mb-6">
              Contact Us
            </h1>
            <p className="text-charcoal-600 max-w-2xl mx-auto">
              We&apos;d love to hear from you. Whether you have a question about our
              collections, need styling advice, or anything else, our team is
              ready to help.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-10">
            {}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-soft-md">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-charcoal-900 mb-1">Email</h3>
                    <a
                      href="mailto:hello@succession.com"
                      className="text-charcoal-600 hover:text-gold-600 transition-colors"
                    >
                      hello@succession.com
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-soft-md">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-charcoal-900 mb-1">Phone</h3>
                    <a
                      href="tel:+911234567890"
                      className="text-charcoal-600 hover:text-gold-600 transition-colors"
                    >
                      +91 123 456 7890
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-soft-md">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-charcoal-900 mb-1">
                      Visit Us
                    </h3>
                    <p className="text-charcoal-600">
                      123 Fashion Street,
                      <br />
                      Mumbai, Maharashtra 400001
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-soft-md">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-charcoal-900 mb-1">Hours</h3>
                    <p className="text-charcoal-600">
                      Mon - Sat: 10:00 AM - 8:00 PM
                      <br />
                      Sunday: 11:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {}
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