"use client";

import { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "gold" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  magnetic?: boolean;
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
      magnetic = false,
      children,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);

    const baseStyles = `
      relative inline-flex items-center justify-center gap-2
      font-sans font-medium tracking-wide
      transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
      disabled:opacity-50 disabled:cursor-not-allowed
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      overflow-hidden
    `;

    const variants = {
      primary: `
        bg-charcoal-900 text-cream-100
        hover:bg-charcoal-800
        active:scale-[0.98]
        focus-visible:ring-charcoal-900 focus-visible:ring-offset-cream-100
      `,
      secondary: `
        bg-transparent text-charcoal-900
        border border-charcoal-900
        hover:bg-charcoal-900 hover:text-cream-100
        active:scale-[0.98]
        focus-visible:ring-charcoal-900 focus-visible:ring-offset-cream-100
      `,
      ghost: `
        bg-transparent text-charcoal-700
        hover:text-charcoal-900 hover:bg-charcoal-100
        active:scale-[0.98]
        focus-visible:ring-charcoal-500 focus-visible:ring-offset-cream-100
      `,
      gold: `
        bg-gold-500 text-white
        hover:bg-gold-600
        shadow-[0_0_20px_rgba(192,88,0,0.15)]
        hover:shadow-[0_8px_24px_-4px_rgba(192,88,0,0.3)]
        active:scale-[0.98]
        focus-visible:ring-gold-500 focus-visible:ring-offset-cream-100
      `,
      danger: `
        bg-burgundy-500 text-white
        hover:bg-burgundy-600
        active:scale-[0.98]
        focus-visible:ring-burgundy-500 focus-visible:ring-offset-cream-100
      `,
    };

    const sizes = {
      sm: "px-4 py-2 text-sm rounded-md",
      md: "px-6 py-3 text-sm rounded-lg",
      lg: "px-8 py-4 text-base rounded-lg",
      xl: "px-10 py-5 text-lg rounded-xl",
    };

    const ButtonContent = (
      <>
        {/* Shimmer effect on hover */}
        {isHovered && !disabled && !isLoading && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          />
        )}

        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Please wait...</span>
            </>
          ) : (
            <>
              {leftIcon && (
                <motion.span
                  initial={false}
                  animate={{ x: isHovered && !disabled ? -2 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  {leftIcon}
                </motion.span>
              )}
              {children}
              {rightIcon && (
                <motion.span
                  initial={false}
                  animate={{ x: isHovered && !disabled ? 2 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  {rightIcon}
                </motion.span>
              )}
            </>
          )}
        </span>
      </>
    );

    if (magnetic && !disabled && !isLoading) {
      return (
        <motion.button
          ref={ref}
          disabled={disabled || isLoading}
          className={cn(
            baseStyles,
            variants[variant],
            sizes[size],
            fullWidth && "w-full",
            className
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          {...props}
        >
          {ButtonContent}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {ButtonContent}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };