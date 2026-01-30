"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  Check,
  ChevronRight,
  Tag,
  X,
  Truck,
  Lock,
  User as UserIcon,
  Smartphone,
  Mail,
  ArrowRight,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button, Input, Divider, Badge } from "@/components/ui";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { checkoutApi, accountApi, authApi, AddressInput, Address } from "@/lib/api";
import toast from "react-hot-toast";

type Step = "auth" | "address" | "payment";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, subtotal, itemCount, fetchCart, cartId } = useCartStore();
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  const [step, setStep] = useState<Step>("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  
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

  
  useEffect(() => {
    if (isAuthenticated) {
      if (step === "auth") setStep("address");
    } else {
      setStep("auth");
    }
  }, [isAuthenticated]);

  
  useEffect(() => {
    if (isAuthenticated) {
      accountApi.getAddresses().then((data) => {
        setSavedAddresses(data.addresses);
        const defaultAddr = data.addresses.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  
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

  
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);


  const deliveryCharge = 0; // Free delivery always
  const discount = appliedCoupon?.discount || 0;
  const total = subtotal - discount;

  
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);

    try {
      const { discount, coupon } = await checkoutApi.applyCoupon(
        couponCode.trim().toUpperCase(),
        subtotal
      );
      setAppliedCoupon({ code: coupon.code, discount });
      toast.success(`Coupon applied! You save ${formatPrice(discount)}`);
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

  const handleSendOtp = async () => {
    if (!authForm.email || !authForm.email.includes("@")) {
      toast.error("Kindly enter a valid email address");
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
      toast.error(error instanceof Error ? error.message : "Unable to send verification code");
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
      
      
      setAddress(prev => ({
        ...prev,
        name: authForm.name,
        email: authForm.email,
        phone: authForm.phone
      }));

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

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

    if (!addr.name || !addr.email || !addr.phone || !addr.street || !addr.city || !addr.state || !addr.pincode) {
      toast.error("Complete all address details");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr.email)) {
      toast.error("Kindly enter a valid email address");
      return false;
    }

    if (!/^[0-9]\d{9}$/.test(addr.phone.replace(/\D/g, ""))) {
        
        
    }

    if (!/^\d{6}$/.test(addr.pincode)) {
      toast.error("Please provide a valid six-digit pincode");
      return false;
    }

    return true;
  };

  const handleProceedToPayment = async () => {
    if (!validateAddress()) return;
    setStep("payment");
  };

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
        name: "Succession",
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
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: addr.name,
          email: addr.email,
          contact: addr.phone,
        },
        theme: {
          color: "#1A1A1A",
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

  if (itemCount === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-20 h-20 rounded-full bg-cream-200 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-charcoal-400" />
        </div>
        <h1 className="font-display text-2xl text-charcoal-900 mb-4">
          Your Bag is Empty
        </h1>
        <p className="text-charcoal-600 mb-8">
          Add some items to your bag to proceed with checkout.
        </p>
        <Link href="/collections">
          <Button variant="primary" size="lg">
            Shop Collections
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-10 lg:gap-16">
      {}
      <div className="lg:col-span-2">
        {}
        <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-2">
          <StepIndicator
            step={1}
            label="Account"
            icon={<UserIcon className="w-5 h-5" />}
            isActive={step === "auth"}
            isComplete={step === "address" || step === "payment" || isAuthenticated}
          />
          <ChevronRight className="w-5 h-5 text-charcoal-300 flex-shrink-0" />
          <StepIndicator
            step={2}
            label="Address"
            icon={<MapPin className="w-5 h-5" />}
            isActive={step === "address"}
            isComplete={step === "payment"}
          />
          <ChevronRight className="w-5 h-5 text-charcoal-300 flex-shrink-0" />
          <StepIndicator
            step={3}
            label="Payment"
            icon={<CreditCard className="w-5 h-5" />}
            isActive={step === "payment"}
            isComplete={false}
          />
        </div>

        {}
        {step === "auth" && !isAuthenticated && (
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
           >
              <h2 className="font-display text-2xl text-charcoal-900 mb-2">
                Contact Information
              </h2>
              <p className="text-charcoal-600 mb-8">Enter your details to proceed with the order.</p>

              <div className="bg-white rounded-2xl p-6 shadow-soft-md">
                {!otpSent ? (
                    <div className="space-y-4">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={authForm.name}
                            onChange={(e) => setAuthForm(prev => ({...prev, name: e.target.value}))}
                            variant="luxury"
                        />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="john@example.com"
                                value={authForm.email}
                                onChange={(e) => setAuthForm(prev => ({...prev, email: e.target.value}))}
                                variant="luxury"
                            />
                            <Input
                                label="Phone"
                                type="tel"
                                placeholder="9876543210"
                                value={authForm.phone}
                                onChange={(e) => setAuthForm(prev => ({...prev, phone: e.target.value}))}
                                variant="luxury"
                            />
                         </div>
                         <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={handleSendOtp}
                            isLoading={isLoading}
                         >
                            Continue
                         </Button>
                         <div className="text-center pt-2">
                            <Link href="/login?redirect=/checkout" className="text-sm text-gold-600 hover:underline">
                                Already have an account? Login with Password
                            </Link>
                         </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-charcoal-600 mb-1">Enter the 6-digit code sent to</p>
                            <p className="font-medium text-charcoal-900">{authForm.email}</p>
                            <button 
                                onClick={() => setOtpSent(false)} 
                                className="text-sm text-gold-600 hover:underline mt-2"
                            >
                                Change Email
                            </button>
                        </div>

                        <div className="max-w-xs mx-auto">
                            <Input
                                label="OTP Code"
                                placeholder="123456"
                                value={authForm.otp}
                                onChange={(e) => setAuthForm(prev => ({...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6)}))}
                                variant="luxury"
                                className="text-center tracking-widest text-xl"
                            />
                        </div>

                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={handleVerifyOtp}
                            isLoading={isLoading}
                        >
                            Verify & Continue
                        </Button>

                        <div className="text-center">
                            <button
                                onClick={handleSendOtp}
                                disabled={otpTimer > 0 || isLoading}
                                className="text-sm text-charcoal-500 hover:text-charcoal-900 disabled:opacity-50"
                            >
                                {otpTimer > 0 ? `Resend code in ${otpTimer}s` : "Resend code"}
                            </button>
                        </div>
                    </div>
                )}
              </div>
           </motion.div>
        )}

        {}
        {step === "address" && (isAuthenticated || true) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
                 <h2 className="font-display text-2xl text-charcoal-900">
                Delivery Address
                </h2>
                {isAuthenticated && (
                     <p className="text-sm text-charcoal-500">
                         Logged in as <span className="text-charcoal-900 font-medium">{user?.email}</span>
                     </p>
                )}
            </div>
           

            {}
            {isAuthenticated && savedAddresses.length > 0 && !showNewAddressForm && (
              <div className="space-y-4 mb-6">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer transition-colors",
                      selectedAddressId === addr.id
                        ? "border-charcoal-900 bg-cream-50"
                        : "border-charcoal-200 hover:border-charcoal-300"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-charcoal-900">
                          {addr.name}
                          {addr.isDefault && (
                            <Badge variant="gold" size="sm" className="ml-2">
                              Default
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-charcoal-600 mt-1">
                          {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-sm text-charcoal-500 mt-1">
                          {addr.phone}
                        </p>
                      </div>
                      {selectedAddressId === addr.id && (
                        <div className="w-6 h-6 rounded-full bg-charcoal-900 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    setShowNewAddressForm(true);
                    setSelectedAddressId(null);
                  }}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-charcoal-200 text-charcoal-600 hover:border-charcoal-400 hover:text-charcoal-900 transition-colors"
                >
                  + Add New Address
                </button>
              </div>
            )}

            {}
            {(savedAddresses.length === 0 || showNewAddressForm) && (
              <div className="bg-white rounded-2xl p-6 shadow-soft-md">
                {showNewAddressForm && (
                  <button
                    onClick={() => {
                      setShowNewAddressForm(false);
                      if (savedAddresses.length > 0) {
                        setSelectedAddressId(savedAddresses[0].id);
                      }
                    }}
                    className="text-sm text-charcoal-600 hover:text-charcoal-900 mb-4 transition-colors"
                  >
                    ← Back to saved addresses
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="John Doe"
                    value={address.name}
                    onChange={(e) =>
                      setAddress({ ...address, name: e.target.value })
                    }
                    variant="luxury"
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="john@example.com"
                    value={address.email}
                    onChange={(e) =>
                      setAddress({ ...address, email: e.target.value })
                    }
                    variant="luxury"
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
                    variant="luxury"
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
                    variant="luxury"
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Street Address"
                      placeholder="123 Main Street, Apartment 4B"
                      value={address.street}
                      onChange={(e) =>
                        setAddress({ ...address, street: e.target.value })
                      }
                      variant="luxury"
                    />
                  </div>
                  <Input
                    label="City"
                    placeholder="Mumbai"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                    variant="luxury"
                  />
                  <Input
                    label="State"
                    placeholder="Maharashtra"
                    value={address.state}
                    onChange={(e) =>
                      setAddress({ ...address, state: e.target.value })
                    }
                    variant="luxury"
                  />
                </div>
              </div>
            )}

            <div className="mt-8">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleProceedToPayment}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Continue to Payment
              </Button>
            </div>
          </motion.div>
        )}

        {}
        {step === "payment" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => setStep("address")}
              className="text-sm text-charcoal-600 hover:text-charcoal-900 mb-6 transition-colors"
            >
              ← Back to address
            </button>

            <h2 className="font-display text-2xl text-charcoal-900 mb-6">
              Payment
            </h2>

            {}
            <div className="bg-white rounded-2xl p-6 shadow-soft-md mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-charcoal-500 mb-1">Delivering to</p>
                  <p className="font-medium text-charcoal-900">
                    {getSelectedAddress()?.name}
                  </p>
                  <p className="text-sm text-charcoal-600">
                    {getSelectedAddress()?.street}, {getSelectedAddress()?.city},{" "}
                    {getSelectedAddress()?.state} - {getSelectedAddress()?.pincode}
                  </p>
                </div>
                <button
                  onClick={() => setStep("address")}
                  className="text-sm text-gold-600 hover:text-gold-700 font-medium"
                >
                  Change
                </button>
              </div>
            </div>

            {}
            <div className="bg-white rounded-2xl p-6 shadow-soft-md mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-5 h-5 text-charcoal-500" />
                <span className="font-medium text-charcoal-900">
                  Secure Payment via Razorpay
                </span>
              </div>
              <p className="text-sm text-charcoal-600">
                You will be redirected to Razorpay&apos;s secure payment gateway to
                complete your purchase. We accept all major credit/debit cards,
                UPI, and net banking.
              </p>
            </div>

            <Button
              variant="gold"
              size="xl"
              fullWidth
              onClick={handlePayment}
              isLoading={isLoading}
              leftIcon={<Lock className="w-5 h-5" />}
            >
              Pay {formatPrice(total)}
            </Button>
          </motion.div>
        )}
      </div>

      {}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl p-6 shadow-soft-md sticky top-32">
          <h3 className="font-display text-lg text-charcoal-900 mb-6">
            Order Summary
          </h3>

          {}
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-cream-200 flex-shrink-0">
                  {item.type === "outfit" && item.outfit?.heroImages?.[0] ? (
                    <Image
                      src={item.outfit.heroImages[0]}
                      alt={item.outfit.title}
                      fill
                      className="object-cover"
                    />
                  ) : item.type === "product" && item.product?.images?.[0] ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal-900 text-sm truncate">
                    {item.type === "outfit"
                      ? item.outfit?.title
                      : item.product?.title}
                  </p>
                  <p className="text-xs text-charcoal-500">Qty: {item.quantity}</p>
                  <p className="text-sm text-charcoal-900 mt-1">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Divider className="mb-6" />

          {}
          <div className="mb-6">
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-gold-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gold-600" />
                  <span className="text-sm font-medium text-gold-700">
                    {appliedCoupon.code}
                  </span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-charcoal-500 hover:text-charcoal-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  onClick={handleApplyCoupon}
                  isLoading={isApplyingCoupon}
                  disabled={!couponCode.trim()}
                >
                  Apply
                </Button>
              </div>
            )}
          </div>

          {}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-600">Subtotal</span>
              <span className="text-charcoal-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-600 flex items-center gap-1">
                <Truck className="w-4 h-4" />
                Delivery
              </span>
              <span className="text-charcoal-900">
                {deliveryCharge === 0 ? (
                  <span className="text-gold-600">Free</span>
                ) : (
                  formatPrice(deliveryCharge)
                )}
              </span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm">
                <span className="text-gold-600">Discount</span>
                <span className="text-gold-600">
                  -{formatPrice(appliedCoupon.discount)}
                </span>
              </div>
            )}
          </div>

          <Divider className="mb-6" />

          <div className="flex justify-between items-center">
            <span className="font-medium text-charcoal-900">Total</span>
            <span className="font-serif text-2xl text-charcoal-900">
              {formatPrice(total)}
            </span>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gold-600 mt-4 text-center font-medium tracking-wide"
          >
            Delivered with Distinction — Complimentary on Every Order
          </motion.p>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({
  step,
  label,
  icon,
  isActive,
  isComplete,
}: {
  step: number;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  isComplete: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        isActive ? "text-charcoal-900" : isComplete ? "text-gold-600" : "text-charcoal-400"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          isActive
            ? "bg-charcoal-900 text-white"
            : isComplete
            ? "bg-gold-500 text-white"
            : "bg-charcoal-100 text-charcoal-400"
        )}
      >
        {isComplete ? <Check className="w-5 h-5" /> : icon}
      </div>
      <span className="font-medium whitespace-nowrap hidden sm:block">{label}</span>
    </div>
  );
}