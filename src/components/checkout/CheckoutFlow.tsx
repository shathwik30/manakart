"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  Check,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { checkoutApi, accountApi, authApi, AddressInput, Address } from "@/lib/api";
import toast from "react-hot-toast";

type Step = "auth" | "address" | "payment" | "review";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutFlow() {
  const router = useRouter();
  const { items, subtotal, itemCount, fetchCart, cartId } = useCartStore();
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  const [step, setStep] = useState<Step>("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    phone: "",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const [address, setAddress] = useState<AddressInput>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Determine initial step based on auth status
  useEffect(() => {
    if (isAuthenticated) {
      if (step === "auth") setStep("address");
    } else {
      setStep("auth");
    }
  }, [isAuthenticated]);

  // Fetch saved addresses when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      accountApi
        .getAddresses()
        .then((data) => {
          setSavedAddresses(data.addresses);
          const defaultAddr = data.addresses.find((a) => a.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Pre-fill address form with user data
  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const deliveryCharge = 0;
  const discount = appliedCoupon?.discount || 0;
  const total = subtotal - discount;

  // --- Auth handlers ---

  const handleSendOtp = async () => {
    if (!authForm.email || !authForm.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!authForm.name) {
      toast.error("Please provide your name");
      return;
    }
    if (!authForm.phone || authForm.phone.length < 10) {
      toast.error("Please provide a valid phone number");
      return;
    }
    setIsLoading(true);
    try {
      await authApi.sendOtp(authForm.email);
      setOtpSent(true);
      setOtpTimer(60);
      toast.success("Verification code sent to your email");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to send verification code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!authForm.otp || authForm.otp.length !== 6) {
      toast.error("Please enter your six-digit verification code");
      return;
    }
    setIsLoading(true);
    try {
      await authApi.verifyOtp({
        email: authForm.email,
        otp: authForm.otp,
        name: authForm.name,
        phone: authForm.phone,
      });
      await checkAuth();
      toast.success("Verification complete");
      setStep("address");
      setAddress((prev) => ({
        ...prev,
        name: authForm.name,
        email: authForm.email,
        phone: authForm.phone,
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Address helpers ---

  const getSelectedAddress = (): AddressInput | null => {
    if (selectedAddressId && !showNewAddressForm) {
      const saved = savedAddresses.find((a) => a.id === selectedAddressId);
      if (saved) {
        return {
          name: saved.name,
          email: saved.email,
          phone: saved.phone,
          street: saved.street,
          city: saved.city,
          state: saved.state,
          pincode: saved.pincode,
        };
      }
    }
    return address;
  };

  const validateAddress = (): boolean => {
    const addr = getSelectedAddress();
    if (!addr) return false;
    if (
      !addr.name ||
      !addr.email ||
      !addr.phone ||
      !addr.street ||
      !addr.city ||
      !addr.state ||
      !addr.pincode
    ) {
      toast.error("Complete all address details");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!/^\d{6}$/.test(addr.pincode)) {
      toast.error("Please provide a valid six-digit pincode");
      return false;
    }
    return true;
  };

  const handleProceedToPayment = () => {
    if (!validateAddress()) return;
    setStep("payment");
  };

  const handleProceedToReview = () => {
    setStep("review");
  };

  // --- Coupon handlers ---

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    try {
      const { discount: disc, coupon } = await checkoutApi.applyCoupon(
        couponCode.trim().toUpperCase(),
        subtotal
      );
      setAppliedCoupon({ code: coupon.code, discount: disc });
      toast.success(`Coupon applied! You save ${formatPrice(disc)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  // --- Payment handler ---

  const handlePayment = async () => {
    const addr = getSelectedAddress();
    if (!addr) return;
    setIsLoading(true);
    try {
      const paymentData = await checkoutApi.createPayment({
        cartId: cartId!,
        address: addr,
        couponCode: appliedCoupon?.code,
        subtotal,
        deliveryCharge,
        discount,
        total,
      });
      const options = {
        key: paymentData.razorpayKeyId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "ManaKart",
        description: `Order ${paymentData.orderNumber}`,
        order_id: paymentData.razorpayOrderId,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const result = await checkoutApi.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              checkoutData: paymentData.checkoutData,
            });
            toast.success("Order placed successfully!");
            fetchCart();
            router.push(`/order-success?orderId=${result.order.id}`);
          } catch {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: addr.name,
          email: addr.email,
          contact: addr.phone,
        },
        theme: {
          color: "#388e3c",
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment failed");
      setIsLoading(false);
    }
  };

  // --- Helper: check if a step is complete ---

  const isStepComplete = (s: Step): boolean => {
    const order: Step[] = ["auth", "address", "payment", "review"];
    return order.indexOf(s) < order.indexOf(step);
  };

  const selectedAddr = getSelectedAddress();

  // --- Empty cart ---

  if (itemCount === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-lg mx-auto">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-200" />
        <h1 className="text-2xl font-semibold mb-2 text-gray-900">
          Your Cart is Empty
        </h1>
        <p className="text-sm mb-6 text-gray-500">
          Add some items to your cart to proceed with checkout.
        </p>
        <Link
          href="/products"
          className="inline-block px-6 py-2.5 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // --- Main checkout layout ---

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Left column: steps */}
      <div className="flex-1 space-y-3">
        {/* ─── Step 1: Login / Account ─── */}
        <CheckoutSection
          stepNumber={1}
          title="Login"
          isActive={step === "auth" && !isAuthenticated}
          isComplete={isAuthenticated}
          completeSummary={
            isAuthenticated && user ? (
              <span className="text-sm text-gray-900">
                {user.name} &mdash; {user.email}
              </span>
            ) : null
          }
          onChangeClick={undefined}
        >
          {step === "auth" && !isAuthenticated && (
            <div>
              {!otpSent ? (
                <div className="space-y-3">
                  <Input
                    label="Full Name"
                    placeholder="John Doe"
                    value={authForm.name}
                    onChange={(e) =>
                      setAuthForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Email"
                      type="email"
                      placeholder="john@example.com"
                      value={authForm.email}
                      onChange={(e) =>
                        setAuthForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      placeholder="9876543210"
                      value={authForm.phone}
                      onChange={(e) =>
                        setAuthForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                    />
                  </div>
                  <button
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="px-10 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                  >
                    {isLoading ? "Please wait..." : "Continue"}
                  </button>
                  <div className="pt-1">
                    <Link
                      href="/login?redirect=/checkout"
                      className="text-sm hover:underline text-green-600 hover:text-green-700"
                    >
                      Already have an account? Sign in
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Enter the 6-digit code sent to{" "}
                      <span className="font-semibold text-gray-900">
                        {authForm.email}
                      </span>
                    </p>
                    <button
                      onClick={() => setOtpSent(false)}
                      className="text-xs hover:underline mt-1 text-green-600 hover:text-green-700"
                    >
                      Change Email
                    </button>
                  </div>
                  <div className="max-w-[200px]">
                    <Input
                      label="OTP Code"
                      placeholder="123456"
                      value={authForm.otp}
                      onChange={(e) =>
                        setAuthForm((prev) => ({
                          ...prev,
                          otp: e.target.value.replace(/\D/g, "").slice(0, 6),
                        }))
                      }
                    />
                  </div>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={isLoading}
                    className="px-10 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                  >
                    {isLoading ? "Verifying..." : "Verify & Continue"}
                  </button>
                  <div>
                    <button
                      onClick={handleSendOtp}
                      disabled={otpTimer > 0 || isLoading}
                      className="text-xs disabled:opacity-50 hover:underline text-green-600 hover:text-green-700"
                    >
                      {otpTimer > 0 ? `Resend code in ${otpTimer}s` : "Resend code"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CheckoutSection>

        {/* ─── Step 2: Shipping Address ─── */}
        <CheckoutSection
          stepNumber={2}
          title="Shipping Address"
          isActive={step === "address"}
          isComplete={isStepComplete("address")}
          completeSummary={
            isStepComplete("address") && selectedAddr ? (
              <span className="text-sm text-gray-900">
                {selectedAddr.name}, {selectedAddr.street}, {selectedAddr.city},{" "}
                {selectedAddr.state} - {selectedAddr.pincode}
              </span>
            ) : null
          }
          onChangeClick={
            isStepComplete("address") ? () => setStep("address") : undefined
          }
        >
          {step === "address" && (
            <div>
              {/* Saved addresses */}
              {isAuthenticated && savedAddresses.length > 0 && !showNewAddressForm && (
                <div className="space-y-3 mb-4">
                  <p className="text-sm font-semibold text-gray-900">
                    Your addresses
                  </p>
                  {savedAddresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer",
                        selectedAddressId === addr.id
                          ? "bg-green-50 border-green-600"
                          : "bg-white border-gray-200"
                      )}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 accent-green-600"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {addr.name}
                          {addr.isDefault && (
                            <span className="text-xs font-normal ml-2 px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                              Default
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-900">
                          {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-sm text-gray-500">
                          Phone: {addr.phone}
                        </p>
                      </div>
                    </label>
                  ))}
                  <button
                    onClick={() => {
                      setShowNewAddressForm(true);
                      setSelectedAddressId(null);
                    }}
                    className="text-sm hover:underline text-green-600 hover:text-green-700"
                  >
                    + Add a new address
                  </button>
                </div>
              )}

              {/* New address form */}
              {(savedAddresses.length === 0 || showNewAddressForm) && (
                <div className="space-y-3">
                  {showNewAddressForm && (
                    <button
                      onClick={() => {
                        setShowNewAddressForm(false);
                        if (savedAddresses.length > 0) {
                          setSelectedAddressId(savedAddresses[0].id);
                        }
                      }}
                      className="text-sm hover:underline mb-2 text-green-600 hover:text-green-700"
                    >
                      &larr; Back to saved addresses
                    </button>
                  )}
                  <p className="text-sm font-semibold text-gray-900">
                    Add a new address
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      placeholder="9876543210"
                      value={address.phone}
                      onChange={(e) =>
                        setAddress({
                          ...address,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                    />
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    placeholder="john@example.com"
                    value={address.email}
                    onChange={(e) => setAddress({ ...address, email: e.target.value })}
                  />
                  <Input
                    label="Street Address"
                    placeholder="123 Main Street, Apartment 4B"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="City"
                      placeholder="Mumbai"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    />
                    <Input
                      label="State"
                      placeholder="Maharashtra"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    />
                    <Input
                      label="Pincode"
                      placeholder="400001"
                      value={address.pincode}
                      onChange={(e) =>
                        setAddress({
                          ...address,
                          pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={handleProceedToPayment}
                  className="px-10 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                >
                  Use this address
                </button>
              </div>
            </div>
          )}
        </CheckoutSection>

        {/* ─── Step 3: Payment Method ─── */}
        <CheckoutSection
          stepNumber={3}
          title="Payment Method"
          isActive={step === "payment"}
          isComplete={isStepComplete("payment")}
          completeSummary={
            isStepComplete("payment") ? (
              <span className="text-sm text-gray-900">
                {paymentMethod === "online"
                  ? "Pay Online (Razorpay)"
                  : "Cash on Delivery"}
              </span>
            ) : null
          }
          onChangeClick={
            isStepComplete("payment") ? () => setStep("payment") : undefined
          }
        >
          {step === "payment" && (
            <div className="space-y-3">
              {/* Online payment */}
              <label
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border cursor-pointer",
                  paymentMethod === "online"
                    ? "bg-green-50 border-green-600"
                    : "bg-white border-gray-200"
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                  className="mt-0.5 accent-green-600"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Pay Online
                  </p>
                  <p className="text-xs text-gray-500">
                    Credit/Debit Card, UPI, Net Banking via Razorpay
                  </p>
                </div>
              </label>

              {/* COD */}
              <label
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border cursor-pointer",
                  paymentMethod === "cod"
                    ? "bg-green-50 border-green-600"
                    : "bg-white border-gray-200"
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-0.5 accent-green-600"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Cash on Delivery
                  </p>
                  <p className="text-xs text-gray-500">
                    Pay when your order is delivered
                  </p>
                </div>
              </label>

              <div className="pt-1">
                <button
                  onClick={handleProceedToReview}
                  className="px-10 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                >
                  Use this payment method
                </button>
              </div>
            </div>
          )}
        </CheckoutSection>

        {/* ─── Step 4: Review & Place Order ─── */}
        <CheckoutSection
          stepNumber={4}
          title="Review Items and Shipping"
          isActive={step === "review"}
          isComplete={false}
          completeSummary={null}
          onChangeClick={undefined}
        >
          {step === "review" && (
            <div>
              {/* Delivery estimate */}
              <p className="text-sm mb-3 text-emerald-600">
                Estimated delivery: 3-5 business days
              </p>

              {/* Item list */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-[80px] h-[80px] flex-shrink-0 rounded-lg overflow-hidden bg-white border border-gray-200">
                      {item.product?.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.title}
                          fill
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-gray-200" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-tight line-clamp-2 text-gray-900">
                        {item.product?.title}
                      </p>
                      {item.variant && (item.variant.optionValues as any[])?.length > 0 && (
                        <p className="text-xs mt-0.5 text-gray-500">
                          {(item.variant.optionValues as any[]).map((ov: any) => `${ov.optionName}: ${ov.valueName}`).join(", ")}
                        </p>
                      )}
                      <p className="text-sm font-semibold mt-1 text-red-600">
                        {formatPrice(item.price)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon section */}
              <div className="mt-5 pt-4 border-t border-gray-200">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100">
                    <span className="text-sm text-emerald-600">
                      Coupon <span className="font-semibold">{appliedCoupon.code}</span>{" "}
                      applied &mdash; saving {formatPrice(appliedCoupon.discount)}
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs hover:underline text-green-600 hover:text-green-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-400 text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || isApplyingCoupon}
                      className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      {isApplyingCoupon ? "..." : "Apply"}
                    </button>
                  </div>
                )}
              </div>

              {/* Place order */}
              <div className="mt-5 pt-4 border-t border-gray-200">
                <button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-10 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                >
                  {isLoading ? "Processing..." : `Place your order — ${formatPrice(total)}`}
                </button>
                <p className="text-xs mt-2 text-gray-500">
                  By placing your order, you agree to ManaKart&apos;s{" "}
                  <Link href="/terms" className="hover:underline text-green-600 hover:text-green-700">
                    Conditions of Use
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="hover:underline text-green-600 hover:text-green-700">
                    Privacy Notice
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}
        </CheckoutSection>
      </div>

      {/* Right column: Order summary */}
      <div className="lg:w-[300px] flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm p-5 sticky top-[110px] border border-gray-200">
          {/* Place order button (top) */}
          {step === "review" && (
            <div className="mb-4">
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                {isLoading ? "Processing..." : "Place your order"}
              </button>
              <p className="text-xs mt-2 text-center text-gray-500">
                By placing your order, you agree to ManaKart&apos;s terms.
              </p>
              <div className="border-t border-gray-200 mt-3 pt-3" />
            </div>
          )}

          <h3 className="text-lg font-semibold mb-3 text-gray-900">
            Order Summary
          </h3>

          <div className="space-y-2 text-sm text-gray-900">
            <div className="flex justify-between">
              <span>Items ({itemCount}):</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping & handling:</span>
              <span className="text-emerald-600">FREE</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600">
                <span>Coupon ({appliedCoupon.code}):</span>
                <span>-{formatPrice(appliedCoupon.discount)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between text-lg font-semibold text-gray-900">
            <span>Order Total:</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Reusable checkout section ---

interface CheckoutSectionProps {
  stepNumber: number;
  title: string;
  isActive: boolean;
  isComplete: boolean;
  completeSummary: React.ReactNode;
  onChangeClick: (() => void) | undefined;
  children: React.ReactNode;
}

function CheckoutSection({
  stepNumber,
  title,
  isActive,
  isComplete,
  completeSummary,
  onChangeClick,
  children,
}: CheckoutSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      {/* Section header */}
      <div
        className={cn(
          "flex items-center justify-between px-5 py-3",
          isActive ? "bg-gray-50 border-b border-gray-200" : "bg-white"
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-lg font-semibold",
              isComplete ? "text-emerald-600" : "text-gray-900"
            )}
          >
            {stepNumber}
          </span>
          <span className="text-lg font-semibold text-gray-900">
            {title}
          </span>
          {isComplete && (
            <Check className="w-5 h-5 text-emerald-600" />
          )}
        </div>
        {isComplete && onChangeClick && (
          <button
            onClick={onChangeClick}
            className="text-sm hover:underline text-green-600 hover:text-green-700"
          >
            Change
          </button>
        )}
      </div>

      {/* Completed summary */}
      {isComplete && completeSummary && !isActive && (
        <div className="px-5 py-3 pl-14">{completeSummary}</div>
      )}

      {/* Active content */}
      {isActive && <div className="px-5 py-4 pl-14">{children}</div>}
    </div>
  );
}
