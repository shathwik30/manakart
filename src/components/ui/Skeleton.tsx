import { cn } from "@/lib/utils";
interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}
export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
}: SkeletonProps) {
  const variants = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-100",
        variants[variant],
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
}
export function ProductCardSkeleton() {
  return (
    <div className="bg-white p-3 rounded-xl">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}
export function DealCardSkeleton() {
  return (
    <div className="bg-white p-3 rounded-xl">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
