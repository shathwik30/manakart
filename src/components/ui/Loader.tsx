import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export function Loader({
  className,
  size = "md",
  fullScreen = false,
}: LoaderProps) {
  const sizes = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
  };

  const spinner = (
    <div
      className={cn(
        "rounded-full border-green-600 border-t-transparent animate-spin",
        sizes[size]
      )}
    />
  );

  if (fullScreen) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-white",
          className
        )}
      >
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <div className={className}>{spinner}</div>;
}

export function Spinner({ className, size = "md" }: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  };
  return (
    <div
      className={cn(
        "rounded-full border-green-600 border-t-transparent animate-spin",
        sizes[size],
        className
      )}
    />
  );
}
