"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  Loader2,
  Check,
  MapPin,
} from "lucide-react";
import { cn, isValidPhone, isValidPincode } from "@/lib/utils";
import { Input, Modal } from "@/components/ui";
import { accountApi, Address, AddressInput } from "@/lib/api";
import toast from "react-hot-toast";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressInput>({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const { addresses } = await accountApi.getAddresses();
      setAddresses(addresses);
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: addresses.length === 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setForm({
      name: address.name,
      email: address.email,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      toast.error("Please provide your name");
      return false;
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Kindly enter a valid email address");
      return false;
    }
    if (!isValidPhone(form.phone)) {
      toast.error("Please provide a valid phone number");
      return false;
    }
    if (!form.street.trim()) {
      toast.error("Please provide your street address");
      return false;
    }
    if (!form.city.trim()) {
      toast.error("Please provide your city");
      return false;
    }
    if (!form.state.trim()) {
      toast.error("Please provide your state");
      return false;
    }
    if (!isValidPincode(form.pincode)) {
      toast.error("Please provide a valid pincode");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      if (editingAddress) {
        await accountApi.updateAddress(editingAddress.id, form);
        toast.success("Address updated successfully");
      } else {
        await accountApi.addAddress(form);
        toast.success("Address added successfully");
      }
      fetchAddresses();
      closeModal();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save address"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    try {
      await accountApi.deleteAddress(id);
      toast.success("Address removed");
      fetchAddresses();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to remove address"
      );
    } finally {
      setDeleteId(null);
    }
  };

  const handleSetDefault = async (address: Address) => {
    if (address.isDefault) return;
    try {
      await accountApi.updateAddress(address.id, { isDefault: true });
      toast.success("Default address updated");
      fetchAddresses();
    } catch (error) {
      toast.error("Unable to update default address");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        Your Addresses
      </h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Add address card */}
          <button
            onClick={openAddModal}
            className="h-[200px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-green-600 hover:text-green-600 transition-colors cursor-pointer bg-white"
          >
            <Plus className="w-10 h-10" />
            <span className="text-lg font-semibold">Add address</span>
          </button>

          {/* Address cards */}
          {addresses.map((address) => (
            <div
              key={address.id}
              className={cn(
                "h-[200px] border rounded-xl p-4 flex flex-col justify-between bg-white",
                address.isDefault
                  ? "border-green-600 border-2"
                  : "border-gray-200"
              )}
            >
              <div className="overflow-hidden">
                {address.isDefault && (
                  <div className="flex items-center gap-1 mb-2">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs font-semibold text-gray-500">
                      Default address
                    </span>
                  </div>
                )}
                <p className="text-sm font-semibold text-gray-900">
                  {address.name}
                </p>
                <p className="text-sm text-gray-900 mt-1 line-clamp-1">
                  {address.street}
                </p>
                <p className="text-sm text-gray-900 line-clamp-1">
                  {address.city}, {address.state} - {address.pincode}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Phone: {address.phone}
                </p>
              </div>

              {/* Edit / Remove links */}
              <div className="flex items-center gap-2 text-sm mt-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => openEditModal(address)}
                  className="text-green-600 hover:text-green-700 hover:underline"
                >
                  Edit
                </button>
                <span className="text-gray-200">|</span>
                {!address.isDefault && (
                  <>
                    <button
                      onClick={() => handleDelete(address.id)}
                      disabled={deleteId === address.id}
                      className="text-green-600 hover:text-green-700 hover:underline disabled:opacity-50"
                    >
                      {deleteId === address.id ? "Removing..." : "Remove"}
                    </button>
                    <span className="text-gray-200">|</span>
                    <button
                      onClick={() => handleSetDefault(address)}
                      className="text-green-600 hover:text-green-700 hover:underline"
                    >
                      Set as Default
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingAddress ? "Edit your address" : "Add a new address"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Full name (First and Last name)"
            placeholder="Enter your full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Mobile number"
            placeholder="10-digit mobile number"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value.replace(/\D/g, "").slice(0, 10),
              })
            }
          />
          <Input
            label="Pincode"
            placeholder="6-digit pincode"
            value={form.pincode}
            onChange={(e) =>
              setForm({
                ...form,
                pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
              })
            }
          />
          <Input
            label="Flat, House no., Building, Company, Apartment"
            placeholder="Street address"
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              placeholder="Enter your city"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Input
              label="State"
              placeholder="Enter your state"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={form.isDefault}
              onChange={(e) =>
                setForm({ ...form, isDefault: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-200 text-green-600 focus:ring-green-600"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-900">
              Make this my default address
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isSaving
                ? "Saving..."
                : editingAddress
                ? "Save changes"
                : "Add address"}
            </button>
            <button
              onClick={closeModal}
              disabled={isSaving}
              className="px-6 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
