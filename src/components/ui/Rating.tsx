import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}
export function Rating({
  value,
  max = 5,
  size = "md",
  showValue = false,
  reviewCount,
  className,
}: RatingProps) {
  const sizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: max }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            sizes[size],
            index < Math.floor(value)
              ? "text-amber-500 fill-amber-500"
              : index < value
              ? "text-amber-500 fill-amber-500 opacity-50"
              : "text-gray-200 fill-gray-200"
          )}
        />
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-gray-900">
          {value.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="ml-1 text-sm text-gray-500">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
