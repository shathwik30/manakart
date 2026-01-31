import { cn } from "@/lib/utils";
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "dark" | "success" | "warning" | "danger";
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
    default: "bg-charcoal-100 text-charcoal-700",
    gold: "bg-gold-100 text-gold-700",
    dark: "bg-charcoal-900 text-cream-100",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-burgundy-100 text-burgundy-700",
  };
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium tracking-wide rounded-full",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}