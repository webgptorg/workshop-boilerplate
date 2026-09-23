import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type FieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Label + control + optional hint, stacked.
 */
export function Field({ label, htmlFor, hint, className, children }: FieldProps) {
  return (
    <div className={cn("field", className)}>
      <label className="field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}
