"use client";
import Link from "next/link";
import Image from "next/image";

const footerColumns = {
  getToKnowUs: {
    title: "Get to Know Us",
    links: [
      { label: "About ManaKart", href: "/about" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  shop: {
    title: "Shop With Us",
    links: [
      { label: "Electronics", href: "/category/electronics" },
      { label: "Fashion", href: "/category/fashion" },
      { label: "Home & Kitchen", href: "/category/home-kitchen" },
      { label: "Sports", href: "/category/sports" },
      { label: "All Products", href: "/products" },
    ],
  },
  helpYou: {
    title: "Let Us Help You",
    links: [
      { label: "Your Account", href: "/account" },
      { label: "Your Orders", href: "/account/orders" },
      { label: "Help", href: "/help" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns & Refunds", href: "/returns" },
    ],
  },
  legal: {
    title: "Policies",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
};

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer>
      {/* Back to top */}
      <button
        onClick={scrollToTop}
        className="w-full py-3 text-sm text-gray-300 text-center bg-[#37475a] hover:bg-[#485769] transition-colors"
      >
        Back to top
      </button>

      {/* Main footer content */}
      <div className="bg-[#232f3e]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {Object.values(footerColumns).map((column) => (
              <div key={column.title}>
                <h4 className="text-white font-semibold text-sm mb-4">
                  {column.title}
                </h4>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#131921]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-6">
          <div className="flex flex-col items-center gap-3">
            {/* Logo */}
            <Link href="/">
              <Image
                src="/logo.png"
                alt="ManaKart"
                width={110}
                height={38}
                className="h-[32px] w-auto object-contain brightness-0 invert"
              />
            </Link>

            {/* Copyright and legal links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
              <span>
                &copy; {new Date().getFullYear()} ManaKart. All rights reserved.
              </span>
              <Link href="/privacy" className="hover:text-gray-300 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gray-300 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
