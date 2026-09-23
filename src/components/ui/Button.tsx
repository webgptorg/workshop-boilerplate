import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "medium" | "small";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
};

export function Button({ variant = "primary", size = "medium", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn("button", `button-${variant}`, size === "small" && "button-small", className)}
      {...props}
    />
  );
}
