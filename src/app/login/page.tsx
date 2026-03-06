import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | ManaKart",
  description: "Sign in to your ManaKart account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      {/* Logo */}
      <div className="pt-5 pb-3 flex justify-center">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="ManaKart"
            width={160}
            height={55}
            className="h-[48px] w-auto object-contain"
            priority
          />
        </Link>
      </div>

      {/* Login Form */}
      <div className="max-w-[350px] mx-auto px-4">
        <LoginForm />
      </div>

      {/* Footer */}
      <div className="mt-8 border-t border-gray-200 pt-6 pb-8">
        <div className="max-w-[600px] mx-auto px-4 flex items-center justify-center gap-6 text-xs text-gray-500">
          <Link href="/terms" className="text-green-600 hover:text-green-700 hover:underline">
            Conditions of Use
          </Link>
          <Link href="/privacy" className="text-green-600 hover:text-green-700 hover:underline">
            Privacy Notice
          </Link>
          <Link href="/help" className="text-green-600 hover:text-green-700 hover:underline">
            Help
          </Link>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">
          &copy; {new Date().getFullYear()} ManaKart. All rights reserved.
        </p>
      </div>
    </div>
  );
}
