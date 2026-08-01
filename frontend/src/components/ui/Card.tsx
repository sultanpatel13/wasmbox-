import type { ReactNode } from "react";

interface CardProps {
  title: string;
  value?: string | number;
  icon?: ReactNode;
  children?: ReactNode;
}

/**
 * Small stat/content card used on the Dashboard (and reusable anywhere else).
 * If `value` is passed, it renders as a stat card (title + big number).
 * Otherwise it just renders `children` inside the same card shell.
 */
export function Card({ title, value, icon, children }: CardProps) {
  return (
    <div className="card">
      <div className="card-title">
        {icon} {title}
      </div>
      {value !== undefined ? <div className="card-value">{value}</div> : children}
    </div>
  );
}
