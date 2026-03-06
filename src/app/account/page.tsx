"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  MapPin,
  Shield,
  Phone,
  User,
  Mail,
  Loader2,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { accountApi } from "@/lib/api";
import { isValidPhone } from "@/lib/utils";
import { Button, Input } from "@/components/ui";
import toast from "react-hot-toast";

const accountCards = [
  {
    icon: Package,
    title: "Your Orders",
    description: "Track, return, or buy things again",
    href: "/account/orders",
  },
  {
    icon: Shield,
    title: "Login & Security",
    description: "Edit login, name, and mobile number",
    href: "/account",
    action: "edit-profile",
  },
  {
    icon: MapPin,
    title: "Your Addresses",
    description: "Edit addresses for orders and gifts",
    href: "/account/addresses",
  },
  {
    icon: Phone,
    title: "Contact Us",
    description: "Get help with your account or orders",
    href: "/contact",
  },
];

export default function AccountPage() {
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
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
    setIsEditing(false);
  };

  const handleCardClick = (card: (typeof accountCards)[number]) => {
    if (card.action === "edit-profile") {
      setIsEditing(true);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Your Account
      </h1>

      {/* Account Grid */}
      {!isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accountCards.map((card) => {
            const Icon = card.icon;
            const isLink = !card.action;

            const content = (
              <div className="flex gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {card.description}
                  </p>
                </div>
              </div>
            );

            if (isLink) {
              return (
                <Link key={card.title} href={card.href}>
                  {content}
                </Link>
              );
            }

            return (
              <div key={card.title} onClick={() => handleCardClick(card)}>
                {content}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Profile Form */}
      {isEditing && (
        <div className="max-w-lg">
          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Login & Security
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-900">
                    Name:
                  </label>
                  <Input
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    leftIcon={<User className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-900">
                    Email:
                  </label>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-900">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{user?.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-900">
                    Mobile number:
                  </label>
                  <Input
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    leftIcon={<Phone className="w-4 h-4" />}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save changes"}
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Summary (when not editing) */}
      {!isEditing && user && (
        <div className="mt-6 border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">
              Account Details
            </h2>
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-green-600 hover:text-green-700 hover:underline"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Name</span>
              <p className="text-gray-900 font-medium">
                {user.name || "Not set"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Email</span>
              <p className="text-gray-900 font-medium">{user.email}</p>
            </div>
            <div>
              <span className="text-gray-500">Mobile</span>
              <p className="text-gray-900 font-medium">
                {user.phone || "Not set"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
