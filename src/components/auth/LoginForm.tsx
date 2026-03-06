"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { isValidEmail, isValidPhone } from "@/lib/utils";
import toast from "react-hot-toast";

type Step = "email" | "otp" | "register";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { setUser } = useAuthStore();
  const [step, setStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsLoading(true);
    try {
      await authApi.sendOtp(email);
      toast.success("OTP sent to your email");
      setStep("otp");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter your six-digit verification code");
      return;
    }
    setIsLoading(true);
    try {
      const response = await authApi.verifyOtp({ email, otp });
      if (response.needsRegistration) {
        setIsNewUser(true);
        setStep("register");
        setIsLoading(false);
        return;
      }
      setUser(response.user);
      toast.success("Welcome to ManaKart!");
      router.push(redirect);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide your name");
      return;
    }
    if (!isValidPhone(phone)) {
      toast.error("Please provide a valid phone number");
      return;
    }
    setIsLoading(true);
    try {
      const response = await authApi.verifyOtp({
        email,
        otp,
        name: name.trim(),
        phone: phone.replace(/\D/g, ""),
      });
      setUser(response.user);
      toast.success("Your account has been successfully created");
      router.push(redirect);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await authApi.sendOtp(email);
      toast.success("Verification code sent to your email");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resend verification code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-5">
        {step === "email" && (
          <form onSubmit={handleSendOtp}>
            <h1 className="text-[28px] font-semibold text-gray-900 mb-3">
              Sign in
            </h1>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="name@email.com"
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15 transition-shadow"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-3 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 cursor-pointer disabled:opacity-60 transition-colors"
            >
              {isLoading ? "Sending..." : "Continue"}
            </button>
            <p className="text-xs text-gray-500 mt-4 leading-[1.4]">
              By continuing, you agree to ManaKart&apos;s{" "}
              <Link href="/terms" className="text-green-600 hover:text-green-700 hover:underline">
                Conditions of Use
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-green-600 hover:text-green-700 hover:underline">
                Privacy Notice
              </Link>
              .
            </p>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <h1 className="text-[28px] font-semibold text-gray-900 mb-2">
              Verification required
            </h1>
            <p className="text-sm text-gray-500 mb-4">
              To continue, complete this verification step. We&apos;ve sent a One Time Password (OTP) to{" "}
              <span className="font-semibold text-gray-900">{email}</span>.
              Please enter it below.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                disabled={isLoading}
                placeholder="Enter 6-digit code"
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15 tracking-[0.3em] font-mono text-center transition-shadow"
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-3 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 cursor-pointer disabled:opacity-60 transition-colors"
            >
              {isLoading ? "Verifying..." : "Continue"}
            </button>
            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="text-green-600 hover:text-green-700 hover:underline disabled:opacity-50"
              >
                Resend OTP
              </button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-green-600 hover:text-green-700 hover:underline"
              >
                Change email
              </button>
            </div>
          </form>
        )}

        {step === "register" && (
          <form onSubmit={handleRegister}>
            <h1 className="text-[28px] font-semibold text-gray-900 mb-2">
              Create account
            </h1>
            <p className="text-sm text-gray-500 mb-4">
              Just a few more details to get started.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Your name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  placeholder="First and last name"
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Mobile number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  disabled={isLoading}
                  placeholder="Mobile number"
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15 transition-shadow"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-3 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 cursor-pointer disabled:opacity-60 transition-colors"
            >
              {isLoading ? "Creating account..." : "Create your ManaKart account"}
            </button>
          </form>
        )}
      </div>

      {/* Divider with "New to ManaKart?" */}
      {step === "email" && (
        <>
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#f1f3f6] px-2 text-gray-400">
                New to ManaKart?
              </span>
            </div>
          </div>
          <Link
            href="/login"
            className="block w-full py-2 px-3 text-sm text-center bg-white border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 shadow-sm cursor-pointer transition-colors"
          >
            Create your ManaKart account
          </Link>
        </>
      )}
    </>
  );
}
