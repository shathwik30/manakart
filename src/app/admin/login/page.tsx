"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, secretKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      toast.success("Welcome back, Admin");
      router.push("/admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl border border-gold-200/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-charcoal-900 mb-2">Succession</h1>
          <p className="text-charcoal-500 uppercase tracking-widest text-xs">Admin Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-charcoal-600 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-cream-50 border border-charcoal-200 rounded focus:outline-none focus:border-gold-500 transition-colors"
              placeholder="admin@succession.com"
              required
            />
          </div>
          <div>
            <label htmlFor="secretKey" className="block text-sm font-medium text-charcoal-600 mb-1">
              Secret Key
            </label>
            <input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full px-4 py-2 bg-cream-50 border border-charcoal-200 rounded focus:outline-none focus:border-gold-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-charcoal-900 text-cream-100 py-3 rounded font-medium hover:bg-charcoal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Authenticating..." : "Access Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
