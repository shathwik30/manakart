"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Check, Loader2 } from "lucide-react";
import { Button, Input, Divider } from "@/components/ui";
import { useAuthStore } from "@/store/useAuthStore";
import { accountApi } from "@/lib/api";
import { isValidPhone } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please provide your name");
      return;
    }

    if (phone && !isValidPhone(phone)) {
      toast.error("Please provide a valid phone number");
      return;
    }

    setIsLoading(true);

    try {
      const { user: updatedUser } = await accountApi.updateProfile({
        name: name.trim(),
        phone: phone.replace(/\D/g, ""),
      });

      setUser(updatedUser);
      setIsEditing(false);
      toast.success("Your profile has been updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-charcoal-900 mb-2">
            My Profile
          </h1>
          <p className="text-charcoal-600">
            Manage your personal information
          </p>
        </div>

        {!isEditing && (
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-soft-md">
        {isEditing ? (
          <div className="space-y-6">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-5 h-5" />}
              variant="luxury"
            />

            <Input
              label="Email Address"
              value={user?.email || ""}
              disabled
              leftIcon={<Mail className="w-5 h-5" />}
              variant="luxury"
              hint="Email cannot be changed"
            />

            <Input
              label="Phone Number"
              placeholder="9876543210"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              leftIcon={<Phone className="w-5 h-5" />}
              variant="luxury"
            />

            <Divider className="my-6" />

            <div className="flex gap-4">
              <Button
                variant="primary"
                onClick={handleSave}
                isLoading={isLoading}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Save Changes
              </Button>
              <Button variant="ghost" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-cream-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center">
                <User className="w-6 h-6 text-charcoal-600" />
              </div>
              <div>
                <p className="text-sm text-charcoal-500">Full Name</p>
                <p className="font-medium text-charcoal-900">
                  {user?.name || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-cream-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center">
                <Mail className="w-6 h-6 text-charcoal-600" />
              </div>
              <div>
                <p className="text-sm text-charcoal-500">Email Address</p>
                <p className="font-medium text-charcoal-900">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-cream-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center">
                <Phone className="w-6 h-6 text-charcoal-600" />
              </div>
              <div>
                <p className="text-sm text-charcoal-500">Phone Number</p>
                <p className="font-medium text-charcoal-900">
                  {user?.phone || "Not set"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}