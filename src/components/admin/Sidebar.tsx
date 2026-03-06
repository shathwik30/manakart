"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  LogOut,
  Tag,
  Star,
  Image as ImageIcon,
  Layers,
  Zap,
  Home,
  Building2,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      await logout();
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Categories", href: "/admin/categories", icon: Layers },
    { name: "Brands", href: "/admin/brands", icon: Building2 },
    { name: "Products", href: "/admin/products", icon: ShoppingBag },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Deals", href: "/admin/deals", icon: Zap },
    { name: "Coupons", href: "/admin/coupons", icon: Tag },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Homepage", href: "/admin/homepage", icon: Home },
    { name: "Hero Banners", href: "/admin/hero", icon: ImageIcon },
    { name: "Users", href: "/admin/users", icon: Users },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-gray-100 min-h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-800">
        <Image
          src="/logo.png"
          alt="ManaKart"
          width={130}
          height={45}
          className="h-[34px] w-auto object-contain brightness-0 invert"
        />
        <p className="text-xs text-gray-500 uppercase tracking-wider mt-2">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                isActive
                  ? "bg-green-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors text-sm"
        >
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
