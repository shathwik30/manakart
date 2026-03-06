import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ManaKart | Online Shopping for Everything",
    template: "%s | ManaKart",
  },
  description:
    "Shop millions of products at great prices. Electronics, fashion, home & kitchen, and more. Fast delivery and easy returns.",
  keywords: [
    "online shopping",
    "ecommerce",
    "buy online",
    "best deals",
    "electronics",
    "fashion",
    "home kitchen",
  ],
  authors: [{ name: "ManaKart" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ManaKart",
    title: "ManaKart | Online Shopping for Everything",
    description:
      "Shop millions of products at great prices. Fast delivery and easy returns.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ManaKart | Online Shopping for Everything",
    description:
      "Shop millions of products at great prices. Fast delivery and easy returns.",
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
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#232f3e",
                color: "#FFFFFF",
                fontSize: "13px",
                padding: "10px 16px",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
              success: {
                iconTheme: {
                  primary: "#059669",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#DC2626",
                  secondary: "#fff",
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
