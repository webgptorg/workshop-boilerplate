import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  readonly tone?: BadgeTone;
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return <span className={cn("badge", `badge-${tone}`, className)} {...props} />;
}
