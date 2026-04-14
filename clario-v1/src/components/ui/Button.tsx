import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-[0.98] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" && "rounded-full px-4 py-1.5 text-xs",
        size === "md" && "rounded-full px-5 py-2.5 text-sm",
        size === "lg" && "rounded-full px-7 py-3 text-base",
        variant === "primary" && "bg-primary-gradient text-on-primary shadow-sm",
        variant === "secondary" && "bg-surface-container-highest text-on-surface hover:bg-surface-container-high",
        variant === "ghost" && "text-primary hover:bg-primary-container",
        className
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
