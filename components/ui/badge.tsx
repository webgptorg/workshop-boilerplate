import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "blue" | "green" | "neutral";
};

export function Badge({ tone = "blue", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "badge",
        tone === "green" && "badge-green",
        tone === "neutral" && "badge-neutral",
        className,
      )}
      {...props}
    />
  );
}
