import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}
export function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };
  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || "Avatar"}
        className={cn(
          "rounded-full object-cover bg-charcoal-100",
          sizes[size],
          className
        )}
      />
    );
  }
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center bg-charcoal-900 text-cream-100 font-medium",
        sizes[size],
        className
      )}
    >
      {name ? getInitials(name) : "?"}
    </div>
  );
}