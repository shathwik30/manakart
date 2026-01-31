import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import "./globals.css";


export const metadata: Metadata = {
  title: {
    default: "Succession | Luxury Fashion House",
    template: "%s | Succession",
  },
  description:
    "Discover timeless elegance with our curated collection of luxury fashion. Handcrafted pieces for the discerning individual.",
  keywords: [
    "luxury fashion",
    "designer clothing",
    "old money style",
    "premium fashion",
    "elegant outfits",
  ],
  authors: [{ name: "Succession" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Succession",
    title: "Succession | Luxury Fashion House",
    description:
      "Discover timeless elegance with our curated collection of luxury fashion.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Succession | Luxury Fashion House",
    description:
      "Discover timeless elegance with our curated collection of luxury fashion.",
  },
  robots: {
    index: true,
    follow: true,
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="overflow-x-hidden">
        <Providers>
          <div className="grain-overlay" aria-hidden="true" />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1A1A1A",
                color: "#FAF6F0",
                fontFamily: "var(--font-sans)",
                fontSize: "0.875rem",
                padding: "16px 20px",
                borderRadius: "8px",
                boxShadow: "0 8px 32px -8px rgba(26, 26, 26, 0.2)",
              },
              success: {
                iconTheme: {
                  primary: "#C9A227",
                  secondary: "#FAF6F0",
                },
              },
              error: {
                iconTheme: {
                  primary: "#722F37",
                  secondary: "#FAF6F0",
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}