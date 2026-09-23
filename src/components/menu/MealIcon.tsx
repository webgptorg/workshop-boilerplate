import { cn } from "@/lib/cn";

interface MealIconProps {
  readonly icon: string;
  readonly size?: "small" | "large";
}

export function MealIcon({ icon, size = "large" }: MealIconProps) {
  return (
    <span className={cn("meal-icon", `meal-icon-${size}`)} aria-hidden="true">
      {icon}
    </span>
  );
}
