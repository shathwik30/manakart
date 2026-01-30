import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export function Rating({
  value,
  max = 5,
  size = "md",
  showValue = false,
  className,
}: RatingProps) {
  const sizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: max }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            sizes[size],
            index < value
              ? "text-gold-500 fill-gold-500"
              : "text-charcoal-200 fill-charcoal-200"
          )}
        />
      ))}
      {showValue && (
        <span className="ml-1 text-sm text-charcoal-600 font-medium">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}