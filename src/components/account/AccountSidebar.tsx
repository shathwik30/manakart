"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  Package,
  MapPin,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, Divider } from "@/components/ui";
import { useAuthStore } from "@/store/useAuthStore";
import { User as UserType } from "@/lib/api";
import toast from "react-hot-toast";
interface AccountSidebarProps {
  user: UserType | null;
}
const menuItems = [
  {
    label: "Profile",
    href: "/account",
    icon: User,
  },
  {
    label: "Orders",
    href: "/account/orders",
    icon: Package,
  },
  {
    label: "Addresses",
    href: "/account/addresses",
    icon: MapPin,
  },
];
export function AccountSidebar({ user }: AccountSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/");
  };
  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft-md sticky top-32">
      {}
      <div className="flex items-center gap-4 mb-6">
        <Avatar name={user?.name || "User"} size="lg" />
        <div className="min-w-0">
          <p className="font-medium text-charcoal-900 truncate">
            {user?.name || "User"}
          </p>
          <p className="text-sm text-charcoal-500 truncate">{user?.email}</p>
        </div>
      </div>
      <Divider className="mb-6" />
      {}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive =
            item.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-colors",
                isActive
                  ? "bg-charcoal-900 text-cream-100"
                  : "text-charcoal-700 hover:bg-cream-100"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight
                className={cn("w-4 h-4", isActive ? "text-cream-100" : "text-charcoal-400")}
              />
            </Link>
          );
        })}
      </nav>
      <Divider className="my-6" />
      {}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 w-full px-4 py-3 text-burgundy-500 hover:bg-burgundy-50 rounded-xl transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Sign Out</span>
      </button>
    </div>
  );
}