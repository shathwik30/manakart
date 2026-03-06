"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, secretKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      toast.success("Welcome back, Admin");
      window.location.href = "/admin";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            alt="ManaKart"
            width={160}
            height={55}
            className="h-[48px] w-auto object-contain mb-2"
            priority
          />
          <p className="text-gray-500 uppercase tracking-widest text-xs">Admin Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 transition-colors"
              placeholder="admin@manakart.com"
              required
            />
          </div>
          <div>
            <label htmlFor="secretKey" className="block text-sm font-medium text-gray-600 mb-1">
              Secret Key
            </label>
            <input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 transition-colors"
              placeholder="Enter secret key"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Authenticating..." : "Access Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
