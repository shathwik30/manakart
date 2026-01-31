"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, User, Phone } from "lucide-react";
import { Button, Input, Divider } from "@/components/ui";
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
      toast.error("Kindly enter a valid email address");
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
      const response = await authApi.verifyOtp({
        email,
        otp,
        ...(isNewUser && { name, phone }),
      });
      if (response.isNewUser && !name) {
        setIsNewUser(true);
        setStep("register");
        setIsLoading(false);
        return;
      }
      setUser(response.user);
      toast.success("Welcome back to Succession");
      router.push(redirect);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid OTP";
      if (message.includes("name") || message.includes("phone")) {
        setIsNewUser(true);
        setStep("register");
      } else {
        toast.error(message);
      }
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
    <div className="bg-white rounded-2xl p-8 shadow-soft-lg">
      <AnimatePresence mode="wait">
        {step === "email" && (
          <motion.form
            key="email"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSendOtp}
          >
            <div className="mb-6">
              <Input
                type="email"
                label="Email Address"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-5 h-5" />}
                variant="luxury"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Continue with Email
            </Button>
            <p className="text-center text-sm text-charcoal-500 mt-6">
              We&apos;ll send you a one-time password to verify your email.
            </p>
          </motion.form>
        )}
        {step === "otp" && (
          <motion.form
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleVerifyOtp}
          >
            <button
              type="button"
              onClick={() => setStep("email")}
              className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-charcoal-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Change email
            </button>
            <p className="text-charcoal-600 mb-6">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium text-charcoal-900">{email}</span>
            </p>
            <div className="mb-6">
              <Input
                type="text"
                label="Verification Code"
                placeholder="Six-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                variant="luxury"
                disabled={isLoading}
                className="text-center text-2xl tracking-[0.5em] font-mono"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Verify & Continue
            </Button>
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="text-sm text-charcoal-600 hover:text-charcoal-900 transition-colors disabled:opacity-50"
              >
                Didn&apos;t receive the code? <span className="font-medium">Resend</span>
              </button>
            </div>
          </motion.form>
        )}
        {step === "register" && (
          <motion.form
            key="register"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleRegister}
          >
            <div className="text-center mb-6">
              <h2 className="font-display text-xl text-charcoal-900 mb-2">
                Complete Your Profile
              </h2>
              <p className="text-charcoal-600 text-sm">
                Just a few more details to get started.
              </p>
            </div>
            <div className="space-y-4 mb-6">
              <Input
                type="text"
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-5 h-5" />}
                variant="luxury"
                disabled={isLoading}
              />
              <Input
                type="tel"
                label="Phone Number"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                leftIcon={<Phone className="w-5 h-5" />}
                variant="luxury"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Create Account
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
      <Divider label="or" className="my-8" />
      <p className="text-center text-sm text-charcoal-600">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="text-charcoal-900 hover:text-gold-600 underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-charcoal-900 hover:text-gold-600 underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}