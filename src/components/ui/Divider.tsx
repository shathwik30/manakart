import { cn } from "@/lib/utils";
interface DividerProps {
  variant?: "default" | "gold" | "subtle";
  className?: string;
  label?: string;
}
export function Divider({ variant = "default", className, label }: DividerProps) {
  const variants = {
    default:
      "h-px bg-gradient-to-r from-transparent via-charcoal-200 to-transparent",
    gold: "h-0.5 w-16 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400",
    subtle:
      "h-px bg-gradient-to-r from-transparent via-charcoal-100 to-transparent",
  };
  if (label) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className={cn("flex-1", variants[variant])} />
        <span className="text-sm text-charcoal-500 font-medium">{label}</span>
        <div className={cn("flex-1", variants[variant])} />
      </div>
    );
  }
  return <div className={cn("w-full", variants[variant], className)} />;
}