"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
export function Providers({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const fetchCart = useCartStore((state) => state.fetchCart);
  useEffect(() => {
    checkAuth();
    fetchCart();
  }, [checkAuth, fetchCart]);
  return <>{children}</>;
}