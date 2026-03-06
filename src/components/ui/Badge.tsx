import { cn } from "@/lib/utils";
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "dark" | "success" | "warning" | "danger" | "deal";
  size?: "sm" | "md";
  className?: string;
}
export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    accent: "bg-green-50 text-green-600",
    dark: "bg-gray-900 text-white",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    deal: "bg-red-600 text-white",
  };
  const sizes = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-0.5 text-xs",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-md",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
