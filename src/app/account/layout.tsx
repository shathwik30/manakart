"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/account");
    }
  }, [isLoading, isAuthenticated, router]);
  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-32 pb-20 bg-cream-100">
          <div className="container-luxury flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
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
      <main className="min-h-screen pt-32 pb-20 bg-cream-100">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-4 gap-10 lg:gap-12">
            {}
            <div className="lg:col-span-1">
              <AccountSidebar user={user} />
            </div>
            {}
            <div className="lg:col-span-3">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}