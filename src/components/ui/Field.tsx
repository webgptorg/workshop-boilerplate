import type { ReactNode } from "react";

interface FieldProps {
  readonly label: string;
  readonly hint?: string;
  readonly children: ReactNode;
}

/**
 * Label wrapper for form controls.
 */
export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}
