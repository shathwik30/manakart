"use client";
import { useEffect, useState, use } from "react";
import { adminApi } from "@/lib/adminApi";
import { Order } from "@/lib/api";
import { Loader2, Package, Truck, CheckCircle, XCircle, ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    fetchOrder();
  }, [id]);
  const fetchOrder = async () => {
    try {
      const data = await adminApi.getOrder(id);
      setOrder(data.order);
    } catch {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };
  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      await adminApi.updateOrderStatus(order.id, newStatus as any);
      toast.success("Order status updated");
      fetchOrder();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }
  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">Order not found</p>
        <button onClick={() => router.back()} className="text-green-600 hover:text-green-700 hover:underline">
          Go Back
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            Order #{order.id.slice(-6).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-500">
                Placed upon {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-2 space-y-6">
          {}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="font-medium text-gray-900 mb-4">Items</h2>
            <div className="divide-y divide-gray-200">
                {order.items.map((item) => (
                    <div key={item.id} className="py-4 flex gap-4">
                        <div className="w-20 h-24 bg-white relative rounded overflow-hidden flex-shrink-0">
                            {item.product.images?.[0] && (
                                <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{item.product.title}</h3>
                            {item.variantSnapshot && (item.variantSnapshot as any).optionValues?.length > 0 ? (
                              <p className="text-sm text-gray-500">
                                {((item.variantSnapshot as any).optionValues as any[]).map((ov: any) => `${ov.optionName}: ${ov.valueName}`).join(", ")} x {item.quantity}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-500">{item.size ? `Size: ${item.size} x ` : "Qty: "}{item.quantity}</p>
                            )}
                            <p className="text-green-600 font-medium mt-1">{formatPrice(item.price)}</p>
                        </div>
                        <div className="text-right">
                             <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center bg-gray-50 p-4 rounded">
                <span className="font-semibold text-lg text-gray-600">Total Amount</span>
                <span className="font-semibold text-2xl text-gray-900">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
        {}
        <div className="space-y-6">
             {}
             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="font-medium text-gray-900 mb-4">Order Status</h2>
                <div className="space-y-2">
                     {['CREATED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                         <button
                            key={status}
                            disabled={updating}
                            onClick={() => handleStatusUpdate(status)}
                            className={`w-full flex items-center justify-between px-4 py-2 rounded border transition-all ${
                                order.orderStatus === status 
                                ? 'bg-gray-900 text-gray-50 border-gray-900' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-white'
                            }`}
                         >
                            <span className="text-sm font-medium capitalize">{status.toLowerCase()}</span>
                            {order.orderStatus === status && <CheckCircle size={16} className="text-green-600" />}
                         </button>
                     ))}
                </div>
             </div>
             {}
             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="font-medium text-gray-900 mb-4">Customer</h2>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 font-semibold">
                            {order.user?.name?.[0] || 'G'}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{order.user?.name || 'Guest User'}</p>
                            <p className="text-xs text-gray-400">Customer ID: {order.user?.id.slice(0,8)}</p>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Mail size={14} className="text-gray-500" />
                            <span>{order.user?.email}</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-500" />
                            <span>{order.user?.phone || 'No phone'}</span>
                        </div>
                    </div>
                </div>
             </div>
             {}
             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="font-medium text-gray-900 mb-4">Shipping Address</h2>
                <div className="flex gap-2 text-sm text-gray-600">
                     <MapPin size={16} className="text-gray-500 flex-shrink-0 mt-1" />
                     <div>
                        {}
                        <p>123 Fashion Street,</p>
                        <p>Design District, New York,</p>
                        <p>NY 10012, United States</p>
                     </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}
