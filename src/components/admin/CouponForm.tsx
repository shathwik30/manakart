"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { Coupon } from "@/lib/api";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
interface CouponFormProps {
  initialData?: Coupon | null;
  onSuccess: () => void;
  onCancel: () => void;
}
export function CouponForm({ initialData, onSuccess, onCancel }: CouponFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "FLAT" as "FLAT" | "PERCENTAGE",
    value: "",
    minOrderValue: "",
    maxDiscount: "",
    usageLimit: "",
    expiresAt: "",
    isActive: true,
  });
  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code,
        discountType: initialData.discountType,
        value: String(initialData.discountType === "FLAT" ? initialData.value / 100 : initialData.value),
        minOrderValue: initialData.minOrderValue ? String(initialData.minOrderValue / 100) : "",
        maxDiscount: initialData.maxDiscount ? String(initialData.maxDiscount / 100) : "",
        usageLimit: initialData.usageLimit ? String(initialData.usageLimit) : "",
        expiresAt: initialData.expiresAt ? new Date(initialData.expiresAt).toISOString().split("T")[0] : "",
        isActive: initialData.isActive,
      });
    } else {
       setFormData({
        code: "",
        discountType: "FLAT",
        value: "",
        minOrderValue: "",
        maxDiscount: "",
        usageLimit: "",
        expiresAt: "",
        isActive: true,
      });
    }
  }, [initialData]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        code: formData.code,
        discountType: formData.discountType,
        value: formData.discountType === "FLAT" ? Number(formData.value) * 100 : Number(formData.value),
        isActive: formData.isActive,
      };
      if (formData.minOrderValue) payload.minOrderValue = Number(formData.minOrderValue) * 100;
      if (formData.maxDiscount) payload.maxDiscount = Number(formData.maxDiscount) * 100;
      if (formData.usageLimit) payload.usageLimit = Number(formData.usageLimit);
      if (formData.expiresAt) payload.expiresAt = new Date(formData.expiresAt).toISOString();
      if (initialData) {
        await adminApi.updateCoupon(initialData.id, payload);
        toast.success("Coupon updated");
      } else {
        await adminApi.createCoupon(payload);
        toast.success("Coupon created");
      }
      onSuccess();
    } catch (error) {
      toast.error(initialData ? "Failed to update" : "Failed to create");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
          <input
            type="text"
            required
            placeholder="e.g. SUMMER20"
            className="w-full px-3 py-2 border border-gray-200 rounded focus:border-green-600 outline-none uppercase"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
           <select
            className="w-full px-3 py-2 border border-gray-200 rounded focus:border-green-600 outline-none"
            value={String(formData.isActive)}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
           <select
            className="w-full px-3 py-2 border border-gray-200 rounded focus:border-green-600 outline-none"
            value={formData.discountType}
            onChange={(e) => setFormData({ ...formData, discountType: e.target.value as "FLAT" | "PERCENTAGE" })}
          >
            <option value="FLAT">Flat Amount (₹)</option>
            <option value="PERCENTAGE">Percentage (%)</option>
          </select>
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
           <input
            type="number"
            required
            min="0"
            step="0.01"
            placeholder={formData.discountType === "FLAT" ? "Amount in ₹" : "Percentage"}
            className="w-full px-3 py-2 border border-gray-200 rounded focus:border-green-600 outline-none"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Value (Optional)</label>
           <input
            type="number"
            min="0"
            className="w-full px-3 py-2 border border-gray-200 rounded focus:border-green-600 outline-none"
            value={formData.minOrderValue}
            onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
          />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (Optional)</label>
           <input
            type="number"
            min="0"
            className="w-full px-3 py-2 border border-gray-200 rounded focus:border-green-600 outline-none"
            value={formData.maxDiscount}
            onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit (Optional)</label>
           <input
            type="number"
            min="0"
            className="w-full px-3 py-2 border border-gray-200 rounded focus:border-green-600 outline-none"
            value={formData.usageLimit}
            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
          />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (Optional)</label>
           <input
            type="date"
            className="w-full px-3 py-2 border border-gray-200 rounded focus:border-green-600 outline-none"
            value={formData.expiresAt}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {initialData ? "Update Coupon" : "Create Coupon"}
        </button>
      </div>
    </form>
  );
}
