"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Package,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { accountApi, OrderDetail } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  CREATED: { label: "Order placed", color: "text-gray-900" },
  CONFIRMED: { label: "Confirmed", color: "text-green-600" },
  PROCESSING: { label: "Processing", color: "text-green-700" },
  SHIPPED: { label: "Shipped", color: "text-green-600" },
  DELIVERED: { label: "Delivered", color: "text-emerald-600" },
  CANCELLED: { label: "Cancelled", color: "text-red-600" },
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
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const status = statusLabels[order.orderStatus] || statusLabels.CREATED;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4">
        <Link
          href="/account"
          className="text-green-600 hover:text-green-700 hover:underline"
        >
          Your Account
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link
          href="/account/orders"
          className="text-green-600 hover:text-green-700 hover:underline"
        >
          Your Orders
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-900">Order Details</span>
      </nav>

      {/* Order header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Order Details
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ordered on {formatDate(order.createdAt)} | Order#{" "}
            <span className="text-gray-900">{order.orderNumber}</span>
          </p>
        </div>
        <div
          className={cn(
            "px-3 py-1 rounded-lg text-sm font-semibold",
            order.orderStatus === "DELIVERED"
              ? "bg-emerald-50 text-emerald-600"
              : order.orderStatus === "CANCELLED"
              ? "bg-red-50 text-red-600"
              : "bg-gray-100 text-gray-900"
          )}
        >
          {status.label}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Shipping Address */}
        <div className="border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Shipping Address
          </h3>
          <div className="text-sm text-gray-900">
            <p className="font-medium">{order.addressSnapshot.name}</p>
            <p>{order.addressSnapshot.street}</p>
            <p>
              {order.addressSnapshot.city}, {order.addressSnapshot.state}{" "}
              {order.addressSnapshot.pincode}
            </p>
            <p className="text-gray-500 mt-1">
              Phone: {order.addressSnapshot.phone}
            </p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Payment Method
          </h3>
          <div className="text-sm text-gray-900">
            <p>{order.paymentMethod || "Online Payment"}</p>
            <p className="mt-1">
              Status:{" "}
              <span
                className={cn(
                  "font-medium",
                  order.paymentStatus === "PAID"
                    ? "text-emerald-600"
                    : order.paymentStatus === "FAILED"
                    ? "text-red-600"
                    : "text-green-700"
                )}
              >
                {order.paymentStatus}
              </span>
            </p>
            {order.paymentId && (
              <p className="text-xs text-gray-500 mt-1">
                ID: {order.paymentId}
              </p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Order Summary
          </h3>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Item(s) Subtotal:</span>
              <span className="text-gray-900">
                {formatPrice(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping:</span>
              <span className="text-gray-900">
                {order.deliveryCharge === 0 ? (
                  <span className="text-emerald-600">FREE</span>
                ) : (
                  formatPrice(order.deliveryCharge)
                )}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-emerald-600">Discount:</span>
                <span className="text-emerald-600">
                  -{formatPrice(order.discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
              <span className="text-gray-900">Grand Total:</span>
              <span className="text-gray-900">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className={cn("text-sm font-semibold", status.color)}>
            {status.label}
          </h3>
        </div>

        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4">
              {/* Product image */}
              <div className="w-20 h-20 border border-gray-200 rounded-lg bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                {item.product?.images?.[0] ? (
                  <Image
                    src={item.product.images[0]}
                    alt={item.productTitle}
                    width={80}
                    height={80}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <Package className="w-8 h-8 text-gray-200" />
                )}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={
                    item.product?.slug
                      ? `/product/${item.product.slug}`
                      : "#"
                  }
                  className="text-sm text-green-600 hover:text-green-700 hover:underline line-clamp-2"
                >
                  {item.productTitle}
                </Link>
                {item.variantSnapshot && (item.variantSnapshot as any).optionValues?.length > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {((item.variantSnapshot as any).optionValues as any[]).map((ov: any) => `${ov.optionName}: ${ov.valueName}`).join(", ")}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Qty: {item.quantity}
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {formatPrice(item.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
