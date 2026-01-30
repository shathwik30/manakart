"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Package,
  ChevronRight,
  Loader2,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { Badge, Button, Divider } from "@/components/ui";
import { accountApi, Order } from "@/lib/api";

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  CREATED: { label: "Order Placed", icon: Clock, color: "text-charcoal-500" },
  CONFIRMED: { label: "Confirmed", icon: CheckCircle, color: "text-blue-500" },
  PROCESSING: { label: "Processing", icon: Package, color: "text-amber-500" },
  SHIPPED: { label: "Shipped", icon: Truck, color: "text-indigo-500" },
  DELIVERED: { label: "Delivered", icon: CheckCircle, color: "text-emerald-500" },
  CANCELLED: { label: "Cancelled", icon: XCircle, color: "text-burgundy-500" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { orders } = await accountApi.getOrders({ limit: 20 });
      setOrders(orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl text-charcoal-900 mb-2">
          My Orders
        </h1>
        <p className="text-charcoal-600">Track and manage your orders</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-soft-md text-center">
          <div className="w-20 h-20 rounded-full bg-cream-200 flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-charcoal-400" />
          </div>
          <h3 className="font-display text-xl text-charcoal-900 mb-2">
            Your Collection Timeline
          </h3>
          <p className="text-charcoal-600 mb-8">
            Begin your Succession journey to view your curated selections.
          </p>
          <Link href="/collections">
            <Button variant="primary">Explore Collections</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const status = statusConfig[order.orderStatus] || statusConfig.CREATED;
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-2xl shadow-soft-md overflow-hidden">
      {}
      <div className="p-6 border-b border-charcoal-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-charcoal-500 mb-1">
              Order #{order.orderNumber}
            </p>
            <p className="text-sm text-charcoal-500">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={cn("flex items-center gap-2", status.color)}>
              <StatusIcon className="w-5 h-5" />
              <span className="font-medium">{status.label}</span>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          {order.items.slice(0, 4).map((item, index) => (
            <div
              key={item.id}
              className="relative w-16 h-20 rounded-lg overflow-hidden bg-cream-200"
            >
              {}
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-6 h-6 text-charcoal-300" />
              </div>
              {order.items.length > 4 && index === 3 && (
                <div className="absolute inset-0 bg-charcoal-900/70 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    +{order.items.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-charcoal-600">
              {order.items.length} {order.items.length === 1 ? "item" : "items"}
            </p>
            <p className="font-serif text-xl text-charcoal-900">
              {formatPrice(order.total)}
            </p>
          </div>

          <Link href={`/account/orders/${order.id}`}>
            <Button
              variant="secondary"
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}