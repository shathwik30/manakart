"use client";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}
interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  variant?: "default" | "outline";
}
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      options,
      placeholder = "Select an option",
      variant = "default",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      w-full appearance-none cursor-pointer text-sm
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none transition-all duration-150
    `;
    const variants = {
      default: `
        px-3 py-2.5 pr-8 bg-gray-50
        border border-gray-300 rounded-lg
        text-gray-900
        focus:border-green-500 focus:ring-2 focus:ring-green-500/20
        ${error ? "border-red-500" : ""}
      `,
      outline: `
        px-3 py-2.5 pr-8 bg-white
        border border-gray-300 rounded-lg
        text-gray-900
        focus:border-green-500 focus:ring-2 focus:ring-green-500/20
        ${error ? "border-red-500" : ""}
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
          <select
            ref={ref}
            disabled={disabled}
            className={cn(baseStyles, variants[variant], className)}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {hint && !error && (
          <p className="mt-1 text-xs text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
export { Select };
export type { SelectProps, SelectOption };
