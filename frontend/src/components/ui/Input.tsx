import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

/**
 * Reusable text input. Reuses the app's existing `.form-group` / `.input-wrapper`
 * styles (already used on the Login page) so it looks consistent everywhere.
 */
export function Input({ label, error, icon, id, className, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="form-group">
      {label && <label htmlFor={inputId}>{label}</label>}
      <div className="input-wrapper">
        {icon}
        <input id={inputId} className={className} {...rest} />
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
