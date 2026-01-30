"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Loader2,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  MapPin,
  CreditCard,
} from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { Badge, Button, Divider } from "@/components/ui";
import { accountApi, OrderDetail } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  CREATED: {
    label: "Order Placed",
    icon: Clock,
    color: "text-charcoal-600",
    bgColor: "bg-charcoal-100",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  PROCESSING: {
    label: "Processing",
    icon: Package,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-burgundy-600",
    bgColor: "bg-burgundy-100",
  },
};

export default function OrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { order } = await accountApi.getOrder(id);
      setOrder(order);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      router.push("/account/orders");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const status = statusConfig[order.orderStatus] || statusConfig.CREATED;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-charcoal-600 hover:text-charcoal-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Orders</span>
      </Link>

      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-charcoal-900 mb-2">
            Order #{order.orderNumber}
          </h1>
          <p className="text-charcoal-600">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <div
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full",
            status.bgColor,
            status.color
          )}
        >
          <StatusIcon className="w-5 h-5" />
          <span className="font-medium">{status.label}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-2 space-y-6">
          {}
          <div className="bg-white rounded-2xl p-6 shadow-soft-md">
            <h2 className="font-display text-lg text-charcoal-900 mb-6">
              Order Items
            </h2>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-cream-50 rounded-xl"
                >
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-cream-200 flex-shrink-0 flex items-center justify-center">
                    <Package className="w-6 h-6 text-charcoal-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-charcoal-900">
                      {item.productTitle}
                    </h4>
                    {item.outfitTitle && (
                      <p className="text-sm text-charcoal-500">
                        From: {item.outfitTitle}
                      </p>
                    )}
                    <p className="text-sm text-charcoal-500">
                      Size: {item.size} | Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-serif text-charcoal-900">
                    {formatPrice(item.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="bg-white rounded-2xl p-6 shadow-soft-md">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-charcoal-500" />
              <h2 className="font-display text-lg text-charcoal-900">
                Delivery Address
              </h2>
            </div>

            <div className="p-4 bg-cream-50 rounded-xl">
              <p className="font-medium text-charcoal-900">
                {order.addressSnapshot.name}
              </p>
              <p className="text-charcoal-600 mt-1">
                {order.addressSnapshot.street}
              </p>
              <p className="text-charcoal-600">
                {order.addressSnapshot.city}, {order.addressSnapshot.state} -{" "}
                {order.addressSnapshot.pincode}
              </p>
              <p className="text-charcoal-500 mt-2">
                Phone: {order.addressSnapshot.phone}
              </p>
            </div>
          </div>
        </div>

        {}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-soft-md sticky top-32">
            <h2 className="font-display text-lg text-charcoal-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-charcoal-600">Subtotal</span>
                <span className="text-charcoal-900">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-600">Delivery</span>
                <span className="text-charcoal-900">
                  {order.deliveryCharge === 0 ? (
                    <span className="text-gold-600">Free</span>
                  ) : (
                    formatPrice(order.deliveryCharge)
                  )}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gold-600">Discount</span>
                  <span className="text-gold-600">
                    -{formatPrice(order.discount)}
                  </span>
                </div>
              )}
            </div>

            <Divider className="mb-6" />

            <div className="flex justify-between items-center mb-6">
              <span className="font-medium text-charcoal-900">Total Paid</span>
              <span className="font-serif text-2xl text-charcoal-900">
                {formatPrice(order.total)}
              </span>
            </div>

            {}
            <div className="p-4 bg-cream-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-charcoal-500" />
                <span className="text-sm font-medium text-charcoal-700">
                  Payment
                </span>
              </div>
              <p className="text-sm text-charcoal-600">
                Status:{" "}
                <span
                  className={cn(
                    "font-medium",
                    order.paymentStatus === "PAID"
                      ? "text-emerald-600"
                      : order.paymentStatus === "FAILED"
                      ? "text-burgundy-600"
                      : "text-amber-600"
                  )}
                >
                  {order.paymentStatus}
                </span>
              </p>
              {order.paymentId && (
                <p className="text-xs text-charcoal-500 mt-1">
                  ID: {order.paymentId}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}