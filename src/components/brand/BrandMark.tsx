interface BrandMarkProps {
  readonly size?: number;
}

/**
 * Sprout in a circle, the symbol of Společný stůl.
 */
export function BrandMark({ size = 40 }: BrandMarkProps) {
  return (
    <svg
      className="brand-mark"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="32" cy="32" r="29" fill="none" stroke="var(--brand-sage)" strokeWidth="2.5" />
      <g fill="none" stroke="var(--brand-green)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 46 V27" />
        <path d="M32 33 C32 25 27 21 20 21 C20 28 25 33 32 33 Z" />
        <path d="M32 29 C32 21 37 17 44 17 C44 24 39 29 32 29 Z" />
        <path d="M21 46 H43" />
      </g>
    </svg>
  );
}
