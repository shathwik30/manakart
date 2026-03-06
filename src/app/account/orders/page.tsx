"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Search,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { accountApi, Order } from "@/lib/api";

const statusLabels: Record<string, { label: string; color: string }> = {
  CREATED: { label: "Order placed", color: "text-gray-900" },
  CONFIRMED: { label: "Confirmed", color: "text-green-600" },
  PROCESSING: { label: "Processing", color: "text-green-700" },
  SHIPPED: { label: "Shipped", color: "text-green-600" },
  DELIVERED: { label: "Delivered", color: "text-emerald-600" },
  CANCELLED: { label: "Cancelled", color: "text-red-600" },
};

type TabKey = "all" | "cancelled";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { orders } = await accountApi.getOrders({ limit: 50 });
      setOrders(orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesTab =
      activeTab === "all"
        ? order.orderStatus !== "CANCELLED"
        : order.orderStatus === "CANCELLED";

    const matchesSearch =
      !searchQuery ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.productTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesTab && matchesSearch;
  });

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all", label: "Orders" },
    { key: "cancelled", label: "Cancelled Orders" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        Your Orders
      </h1>

      {/* Search bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search all orders"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
          />
        </div>
        <button className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors">
          Search Orders
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors relative",
              activeTab === tab.key
                ? "text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-gray-900 after:rounded-t"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {activeTab === "cancelled"
              ? "No cancelled orders"
              : "You have no orders"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {activeTab === "cancelled"
              ? "You haven't cancelled any orders."
              : "Looks like you haven't placed an order yet."}
          </p>
          <Link href="/">
            <button className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
              Start Shopping
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const status = statusLabels[order.orderStatus] || statusLabels.CREATED;
  const address = (order as any).addressSnapshot;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Order header bar */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <div>
              <span className="text-xs text-gray-500 uppercase block">
                Order Placed
              </span>
              <span className="text-gray-900">
                {formatDate(order.createdAt)}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase block">
                Total
              </span>
              <span className="text-gray-900">
                {formatPrice(order.total)}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase block">
                Ship To
              </span>
              <span className="text-green-600">
                {address?.name || order.user?.name || "---"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500 uppercase block">
              Order #
            </span>
            <Link
              href={`/account/orders/${order.id}`}
              className="text-green-600 hover:text-green-700 hover:underline"
            >
              {order.orderNumber}
            </Link>
          </div>
        </div>
      </div>

      {/* Order body */}
      <div className="p-4">
        <div className={cn("text-sm font-semibold mb-3", status.color)}>
          {status.label}
        </div>

        <div className="flex flex-wrap gap-4 items-start">
          {/* Product thumbnails */}
          <div className="flex gap-3 flex-wrap">
            {order.items.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="w-16 h-16 border border-gray-200 rounded-lg bg-white flex items-center justify-center overflow-hidden flex-shrink-0"
              >
                {item.product?.images?.[0] ? (
                  <Image
                    src={item.product.images[0]}
                    alt={item.productTitle}
                    width={64}
                    height={64}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <Package className="w-6 h-6 text-gray-200" />
                )}
              </div>
            ))}
            {order.items.length > 5 && (
              <div className="w-16 h-16 border border-gray-200 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                +{order.items.length - 5}
              </div>
            )}
          </div>

          {/* Item titles */}
          <div className="flex-1 min-w-[200px]">
            {order.items.slice(0, 2).map((item) => (
              <p
                key={item.id}
                className="text-sm text-gray-900 truncate"
              >
                {item.productTitle}
              </p>
            ))}
            {order.items.length > 2 && (
              <p className="text-sm text-gray-500">
                and {order.items.length - 2} more item
                {order.items.length - 2 > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* View order detail link */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
          </span>
          <Link
            href={`/account/orders/${order.id}`}
            className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 hover:underline"
          >
            View order details
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
