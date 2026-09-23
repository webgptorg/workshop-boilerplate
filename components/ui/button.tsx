import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "tint";
export type ButtonSize = "medium" | "small";

export function buttonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "medium",
  className?: string,
) {
  return cn("button", `button-${variant}`, size === "small" && "button-small", className);
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "primary",
  size = "medium",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return <button type={type} className={buttonClassName(variant, size, className)} {...props} />;
}
