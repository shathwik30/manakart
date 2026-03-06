"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { Coupon } from "@/lib/api";
import { Plus, Trash2, Tag, Loader2, Copy, Pencil } from "lucide-react";
import { toast } from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { CouponForm } from "@/components/admin/CouponForm";
import { formatPrice } from "@/lib/utils";
export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCoupons();
      setCoupons(data.coupons);
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCoupons();
  }, []);
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await adminApi.deleteCoupon(id);
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch {
      toast.error("Failed to delete coupon");
    }
  };
  const handleCreate = () => {
    setSelectedCoupon(null);
    setIsModalOpen(true);
  };
  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };
  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchCoupons();
  };
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied");
  };
  return (
    <div>
       <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Coupons</h1>
          <p className="text-gray-500 text-sm">Manage discount codes</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} />
          <span>Create Coupon</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-full flex justify-center py-12">
              <Loader2 className="animate-spin text-green-600" size={30} />
           </div>
        ) : coupons.length === 0 ? (
           <div className="col-span-full bg-white p-12 text-center border border-gray-200 rounded-lg">
              <p className="text-gray-500">No coupons found.</p>
           </div>
        ) : (
            coupons.map((coupon) => (
                <div key={coupon.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <Tag size={20} className="text-green-600" />
                            <span className="font-mono font-semibold text-lg text-gray-900 tracking-wider">{coupon.code}</span>
                            <button onClick={() => copyCode(coupon.code)} className="text-gray-400 hover:text-gray-600">
                                <Copy size={14} />
                            </button>
                        </div>
                        <div className="flex gap-2">
                             <button
                                onClick={() => handleEdit(coupon)}
                                className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Pencil size={18} />
                            </button>
                             <button
                                onClick={() => handleDelete(coupon.id)}
                                className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-3xl font-semibold text-gray-900">
                            {coupon.discountType === "FLAT" ? formatPrice(coupon.value) : `${coupon.value}%`}
                        </span>
                        <span className="text-sm text-gray-500 uppercase">OFF</span>
                    </div>
                    <div className="flex gap-2">
                         <div className="text-xs text-gray-500 bg-gray-50 inline-block px-2 py-1 rounded">
                            {coupon.discountType} DISCOUNT
                        </div>
                         {!coupon.isActive && (
                            <div className="text-xs text-red-600 bg-red-50 inline-block px-2 py-1 rounded">
                                INACTIVE
                            </div>
                         )}
                    </div>
                </div>
            ))
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCoupon ? "Edit Coupon" : "Create Coupon"}
      >
        <CouponForm
          initialData={selectedCoupon}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
