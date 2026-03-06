import { cn } from "@/lib/utils";
interface DividerProps {
  variant?: "default" | "accent" | "subtle";
  className?: string;
  label?: string;
}
export function Divider({ variant = "default", className, label }: DividerProps) {
  const variants = {
    default: "h-px bg-gray-200",
    accent: "h-0.5 w-16 bg-green-600",
    subtle: "h-px bg-gray-100",
  };
  if (label) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className={cn("flex-1", variants[variant])} />
        <span className="text-xs text-gray-500">{label}</span>
        <div className={cn("flex-1", variants[variant])} />
      </div>
    );
  }
  return <div className={cn("w-full", variants[variant], className)} />;
}
