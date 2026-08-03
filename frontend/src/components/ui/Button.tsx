import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * Reusable button. Reuses the app's existing `.btn-primary` style for the
 * primary variant so it matches buttons already used elsewhere (e.g. Upload page).
 */
export function Button({
  variant = "primary",
  icon,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        variant === "primary" && "btn-primary",
        variant === "secondary" && "btn-secondary",
        variant === "danger" && "btn-danger",
        className
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
