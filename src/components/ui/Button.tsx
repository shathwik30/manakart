"use client";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "accent" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-semibold text-sm
      cursor-pointer transition-colors duration-150
      disabled:opacity-50 disabled:cursor-not-allowed
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500
    `;
    const variants = {
      primary: `
        bg-gray-900 text-white
        hover:bg-gray-800
        rounded-lg
      `,
      secondary: `
        bg-white text-gray-900
        border border-gray-300
        hover:bg-gray-50 hover:border-gray-400
        rounded-lg
      `,
      ghost: `
        bg-transparent text-green-600
        hover:text-green-700 hover:bg-green-50
        rounded-lg
      `,
      accent: `
        bg-green-600 text-white
        hover:bg-green-700
        rounded-lg
      `,
      danger: `
        bg-red-600 text-white
        hover:bg-red-700
        rounded-lg
      `,
    };
    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-2.5 text-sm",
      xl: "px-8 py-3 text-base",
    };
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], fullWidth && "w-full", className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Please wait...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
export { Button };
export type { ButtonProps };
