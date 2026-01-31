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
  variant?: "default" | "luxury";
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
      w-full appearance-none cursor-pointer
      transition-all duration-300
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none
    `;
    const variants = {
      default: `
        px-4 py-3 pr-10 bg-white
        border border-charcoal-200 rounded-lg
        text-charcoal-900
        focus:border-charcoal-400
        ${error ? "border-burgundy-500 focus:border-burgundy-500" : ""}
      `,
      luxury: `
        px-5 py-4 pr-12 bg-cream-50
        border-0 border-b-2 border-charcoal-200
        text-charcoal-900 rounded-none
        focus:bg-white focus:border-gold-500
        ${error ? "border-burgundy-500 focus:border-burgundy-500" : ""}
      `,
    };
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-sm font-medium text-charcoal-700">
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
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400 pointer-events-none" />
        </div>
        {error && <p className="mt-2 text-sm text-burgundy-500">{error}</p>}
        {hint && !error && (
          <p className="mt-2 text-sm text-charcoal-500">{hint}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
export { Select };
export type { SelectProps, SelectOption };