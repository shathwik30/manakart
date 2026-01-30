"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
} from "lucide-react";

const footerLinks = {
  collections: [
    { label: "Gentlemen", href: "/collections/gentlemen" },
    { label: "Lady", href: "/collections/lady" },
    { label: "Couple", href: "/collections/couple" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Our Story", href: "/about#story" },
    { label: "Craftsmanship", href: "/about#craftsmanship" },
    { label: "Contact", href: "/contact" },
  ],
  support: [
    { label: "Shipping & Returns", href: "/shipping-returns" },
    { label: "Size Guide", href: "/size-guide" },
    { label: "Care Instructions", href: "/care" },
    { label: "FAQs", href: "/faqs" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund-policy" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-charcoal-900 text-cream-100 relative">
      {/* Scroll to top button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={scrollToTop}
        className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center hover:bg-gold-600 transition-all hover:shadow-[0_8px_24px_-4px_rgba(192,88,0,0.4)] group"
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowUp className="w-5 h-5 text-white group-hover:animate-bounce" />
      </motion.button>

      {}
      <div className="border-b border-charcoal-700">
        <div className="container-luxury py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h3 className="font-display text-2xl lg:text-3xl mb-4">
              Join the Inner Circle
            </h3>
            <p className="text-charcoal-300 mb-8 leading-relaxed">
              Be the first to discover new collections, exclusive events, and
              timeless style inspiration.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Handle newsletter signup
                setEmail("");
              }}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <motion.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-5 py-4 bg-charcoal-800 border border-charcoal-700 rounded-lg text-cream-100 placeholder:text-charcoal-400 focus:outline-none focus:border-gold-500 transition-all"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
              <motion.button
                type="submit"
                className="px-8 py-4 bg-gold-500 text-white font-medium tracking-wide hover:bg-gold-600 transition-colors rounded-lg whitespace-nowrap relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">Subscribe</span>
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>

      {}
      <div className="container-luxury py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 lg:gap-12">
          {}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 lg:pr-8">
            <Link href="/" className="inline-block mb-6">
              <h2 className="font-display text-2xl">Succession</h2>
            </Link>
            <p className="text-charcoal-400 text-sm leading-relaxed mb-6">
              Curating timeless elegance for the discerning individual. Each
              piece tells a story of craftsmanship and refined taste.
            </p>

            {}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-charcoal-800 flex items-center justify-center text-charcoal-400 hover:text-gold-500 hover:bg-charcoal-700 transition-colors"
                    aria-label={social.label}
                    whileHover={{ y: -4, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IconComponent className="w-4 h-4" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {}
          <div>
            <h4 className="text-sm font-medium tracking-wider uppercase mb-6">
              Collections
            </h4>
            <ul className="space-y-3">
              {footerLinks.collections.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-charcoal-400 hover:text-cream-100 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {}
          <div>
            <h4 className="text-sm font-medium tracking-wider uppercase mb-6">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-charcoal-400 hover:text-cream-100 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {}
          <div>
            <h4 className="text-sm font-medium tracking-wider uppercase mb-6">
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-charcoal-400 hover:text-cream-100 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-sm font-medium tracking-wider uppercase mb-6">
              Contact
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:hello@succession.com"
                  className="flex items-center gap-3 text-charcoal-400 hover:text-cream-100 transition-colors text-sm"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>hello@succession.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+911234567890"
                  className="flex items-center gap-3 text-charcoal-400 hover:text-cream-100 transition-colors text-sm"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>+91 123 456 7890</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-charcoal-400 text-sm">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    123 Fashion Street,
                    <br />
                    Mumbai, Maharashtra 400001
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {}
      <div className="border-t border-charcoal-700">
        <div className="container-luxury py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-charcoal-400 text-sm">
              © {new Date().getFullYear()} Succession. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-charcoal-400 hover:text-cream-100 transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}