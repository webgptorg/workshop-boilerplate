import { BrandMark } from "./BrandMark";

interface BrandLockupProps {
  /** Shows the tagline under the wordmark, used on the login page */
  readonly isTaglineShown?: boolean;
  readonly size?: "small" | "large";
}

export function BrandLockup({ isTaglineShown = false, size = "small" }: BrandLockupProps) {
  return (
    <div className={`brand-lockup brand-lockup-${size}`}>
      <BrandMark size={size === "large" ? 72 : 36} />
      <div className="brand-text">
        <span className="brand-wordmark">společný stůl</span>
        {isTaglineShown && <span className="brand-tagline">Dobré jídlo. Společně.</span>}
      </div>
    </div>
  );
}
