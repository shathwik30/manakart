"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AccountNavigation } from "@/components/account/AccountSidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/account");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#f1f3f6]">
          <div className="max-w-5xl mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f1f3f6]">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <AccountNavigation />
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
