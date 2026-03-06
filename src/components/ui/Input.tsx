"use client";
import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "outline";
}
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      variant = "default",
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const baseStyles = `
      w-full text-sm text-gray-900
      placeholder:text-gray-400
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none transition-all duration-150
    `;
    const variants = {
      default: `
        px-3 py-2.5 bg-white
        border border-gray-300 rounded-lg
        focus:border-green-500 focus:ring-2 focus:ring-green-500/20
        ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
      `,
      outline: `
        px-3 py-2.5 bg-white
        border-0 border-b-2 border-gray-200
        rounded-none
        focus:border-green-500
        ${error ? "border-red-500 focus:border-red-500" : ""}
      `,
    };
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-1.5 text-sm font-medium text-gray-900">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={isPassword && showPassword ? "text" : type}
            disabled={disabled}
            className={cn(
              baseStyles,
              variants[variant],
              leftIcon && "pl-10",
              (rightIcon || isPassword) && "pr-10",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
          {rightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-xs text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
export { Input };
export type { InputProps };
