"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Input, Badge, Modal, Divider } from "@/components/ui";
import { accountApi, Address, AddressInput } from "@/lib/api";
import { isValidPhone, isValidPincode } from "@/lib/utils";
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
        toast.success("Address successfully updated");
      } else {
        await accountApi.addAddress(form);
        toast.success("Address successfully saved");
      }

      fetchAddresses();
      closeModal();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save address");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);

    try {
      await accountApi.deleteAddress(id);
      toast.success("Address successfully removed");
      fetchAddresses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove address");
    } finally {
      setDeleteId(null);
    }
  };

  const handleSetDefault = async (address: Address) => {
    if (address.isDefault) return;

    try {
      await accountApi.updateAddress(address.id, { isDefault: true });
      toast.success("Your preferred address has been updated");
      fetchAddresses();
    } catch (error) {
      toast.error("Unable to update your preferred address");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-charcoal-900 mb-2">
            My Addresses
          </h1>
          <p className="text-charcoal-600">Manage your delivery addresses</p>
        </div>

        <Button
          variant="primary"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Address
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-soft-md text-center">
          <div className="w-20 h-20 rounded-full bg-cream-200 flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-charcoal-400" />
          </div>
          <h3 className="font-display text-xl text-charcoal-900 mb-2">
            No Delivery Addresses on File
          </h3>
          <p className="text-charcoal-600 mb-8">
            Save an address to streamline your checkout experience.
          </p>
          <Button
            variant="primary"
            onClick={openAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="bg-white rounded-2xl p-6 shadow-soft-md relative"
            >
              {address.isDefault && (
                <Badge variant="gold" className="absolute top-4 right-4">
                  Default
                </Badge>
              )}

              <h3 className="font-medium text-charcoal-900 mb-2 pr-20">
                {address.name}
              </h3>
              <p className="text-charcoal-600 text-sm mb-1">{address.street}</p>
              <p className="text-charcoal-600 text-sm mb-1">
                {address.city}, {address.state} - {address.pincode}
              </p>
              <p className="text-charcoal-500 text-sm">{address.phone}</p>

              <Divider className="my-4" />

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(address)}
                  leftIcon={<Edit2 className="w-4 h-4" />}
                >
                  Edit
                </Button>

                {!address.isDefault && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(address)}
                    >
                      Set as Default
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                      isLoading={deleteId === address.id}
                      className="text-burgundy-500 hover:text-burgundy-600 hover:bg-burgundy-50"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingAddress ? "Edit Address" : "Add New Address"}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
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
            label="Phone"
            placeholder="Your contact number"
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
            placeholder="Six-digit postal code"
            value={form.pincode}
            onChange={(e) =>
              setForm({
                ...form,
                pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
              })
            }
          />
          <div className="md:col-span-2">
            <Input
              label="Street Address"
              placeholder="Street address and unit number"
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
            />
          </div>
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

        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="isDefault"
            checked={form.isDefault}
            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            className="w-4 h-4 rounded border-charcoal-300 text-charcoal-900 focus:ring-charcoal-500"
          />
          <label htmlFor="isDefault" className="text-sm text-charcoal-700">
            Set as default address
          </label>
        </div>

        <div className="flex gap-4 mt-8">
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<Check className="w-4 h-4" />}
          >
            {editingAddress ? "Save Changes" : "Add Address"}
          </Button>
          <Button variant="ghost" onClick={closeModal} disabled={isSaving}>
            Cancel
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}