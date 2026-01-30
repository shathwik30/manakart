"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { Order } from "@/lib/api";
import { Search, Eye, Filter, Loader2, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getOrders({ 
          page, 
          limit: 10, 
          status: statusFilter !== "ALL" ? statusFilter : undefined 
      });
      setOrders(data.orders);
      setTotalCount(data.totalCount);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CREATED": return "bg-gray-100 text-gray-800";
      case "CONFIRMED": return "bg-blue-100 text-blue-800";
      case "PROCESSING": return "bg-purple-100 text-purple-800";
      case "SHIPPED": return "bg-yellow-100 text-yellow-800";
      case "DELIVERED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-charcoal-900 mb-2">Orders</h1>
          <p className="text-charcoal-500 text-sm">Manage customer orders</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-charcoal-200 overflow-hidden">
        {}
        <div className="p-4 border-b border-charcoal-200 flex gap-4 overflow-x-auto">
           {["ALL", "CREATED", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
               <button
                  key={status}
                  onClick={() => { setStatusFilter(status); setPage(1); }}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                      statusFilter === status 
                        ? "bg-charcoal-900 text-cream-100" 
                        : "bg-cream-50 text-charcoal-600 hover:bg-charcoal-200"
                  }`}
               >
                   {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
               </button>
           ))}
        </div>

        {}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream-100 text-charcoal-600 text-xs uppercase tracking-wider font-medium">
              <tr>
                <th className="px-6 py-4 text-left">Order ID</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Customer</th>
                <th className="px-6 py-4 text-left">Total</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-charcoal-500">
                    <div className="flex justify-center items-center gap-2">
                       <Loader2 className="animate-spin" size={20} />
                       <span>Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-charcoal-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-cream-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-charcoal-600">
                       #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal-600">
                       {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal-900 font-medium">
                       {order.items.length} items
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-charcoal-900">
                       {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Link
                          href={`/admin/orders/${order.id}`}
                          className="flex items-center justify-end gap-1 text-gold-500 hover:underline text-sm font-medium"
                       >
                          View Details <ArrowRight size={14} />
                       </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
         {}
         <div className="px-6 py-4 border-t border-charcoal-200 flex items-center justify-between">
            <span className="text-sm text-charcoal-400">
                Showing {orders.length > 0 ? (page - 1) * 10 + 1 : 0} to {Math.min(page * 10, totalCount)} of {totalCount} results
            </span>
            <div className="flex gap-2">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 text-sm border border-charcoal-200 rounded hover:bg-cream-50 disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    disabled={page * 10 >= totalCount}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 text-sm border border-charcoal-200 rounded hover:bg-cream-50 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
