"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Your Account", href: "/account" },
  { label: "Your Orders", href: "/account/orders" },
  { label: "Your Addresses", href: "/account/addresses" },
];

export function AccountNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 rounded-xl bg-white shadow-sm border border-gray-200 p-1">
      {navItems.map((item) => {
        const isActive =
          item.href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-green-600 text-white"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
