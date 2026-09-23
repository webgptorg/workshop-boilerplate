import Link from "next/link";
import { cn } from "@/lib/cn";
import { SproutMark } from "./sprout-mark";

export type LogoProps = {
  /**
   * The large lockup with the tagline is used on the login screen only.
   */
  size?: "large" | "compact";
  href?: string;
};

export function Logo({ size = "compact", href = "/" }: LogoProps) {
  const isLarge = size === "large";

  return (
    <Link href={href} className={cn("logo", isLarge && "logo-large")} aria-label="Společný stůl">
      <SproutMark size={isLarge ? 96 : 40} />
      <span className="logo-text">
        <span className="logo-name">společný stůl</span>
        {isLarge ? <span className="logo-tagline">Dobré jídlo. Společně.</span> : null}
      </span>
    </Link>
  );
}
