"use client";

import { forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "luxury";
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
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === "password";

    const baseStyles = `
      w-full transition-all duration-300
      placeholder:text-charcoal-400
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none
    `;

    const variants = {
      default: `
        px-4 py-3 bg-white
        border border-charcoal-200 rounded-lg
        text-charcoal-900
        focus:border-gold-500 focus:ring-2 focus:ring-gold-500/10
        ${error ? "border-burgundy-500 focus:border-burgundy-500 focus:ring-burgundy-500/10" : ""}
      `,
      luxury: `
        px-5 py-4 bg-cream-50
        border-0 border-b-2 border-charcoal-200
        text-charcoal-900 rounded-none
        focus:bg-white focus:border-gold-500
        ${error ? "border-burgundy-500 focus:border-burgundy-500" : ""}
      `,
    };

    return (
      <div className="w-full">
        {label && (
          <motion.label
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "block mb-2 text-sm font-medium transition-colors duration-200",
              isFocused ? "text-gold-600" : "text-charcoal-700"
            )}
          >
            {label}
          </motion.label>
        )}

        <motion.div
          className="relative"
          animate={{
            scale: isFocused ? 1.01 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          {leftIcon && (
            <motion.div
              className="absolute left-4 top-1/2 -translate-y-1/2"
              animate={{
                color: isFocused ? "rgb(192, 88, 0)" : "rgb(156, 146, 124)",
              }}
              transition={{ duration: 0.2 }}
            >
              {leftIcon}
            </motion.div>
          )}

          <input
            ref={ref}
            type={isPassword && showPassword ? "text" : type}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              baseStyles,
              variants[variant],
              leftIcon && "pl-12",
              (rightIcon || isPassword) && "pr-12",
              className
            )}
            {...props}
          />

          {/* Focus indicator line for luxury variant */}
          {variant === "luxury" && (
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-gold-500"
              initial={{ width: 0 }}
              animate={{ width: isFocused ? "100%" : 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {isPassword && (
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-gold-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </motion.button>
          )}

          {rightIcon && !isPassword && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400">
              {rightIcon}
            </div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 text-sm text-burgundy-500"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {hint && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-sm text-charcoal-500"
          >
            {hint}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };