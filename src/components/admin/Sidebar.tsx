"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, ShoppingCart, Users, Settings, LogOut, Tag, Star, Video, Image } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };
  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: ShoppingBag },
    { name: "Outfits", href: "/admin/outfits", icon: Tag },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Coupons", href: "/admin/coupons", icon: Tag },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Reels", href: "/admin/reels", icon: Video },
    { name: "Marketing", href: "/admin/hero", icon: Image },
  ];
  return (
    <aside className="w-64 bg-charcoal-900 text-cream-100 min-h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-charcoal-800">
        <h1 className="text-2xl font-serif">Succession</h1>
        <p className="text-xs text-charcoal-400 uppercase tracking-wider mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-gold-500 text-white"
                  : "text-charcoal-400 hover:bg-charcoal-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-charcoal-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-charcoal-400 hover:bg-charcoal-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
