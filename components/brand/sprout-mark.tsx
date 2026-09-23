export type SproutMarkProps = {
  size?: number;
};

/**
 * The circular sprout mark from the brand sheet (`prompts/image.png`).
 */
export function SproutMark({ size = 44 }: SproutMarkProps) {
  return (
    <svg
      className="sprout-mark"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="32" cy="32" r="29" fill="none" stroke="var(--color-sage)" strokeWidth="2.5" />
      <g stroke="var(--color-green)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M21 46h22" />
        <path d="M32 46V29" />
        <path d="M32 37c-8.5 0-12-4.5-13-11.5 7 .5 12 4 13 11.5z" fill="var(--color-green)" />
        <path d="M32 31c1-8.5 5.5-12 13-13-1 7.5-4.5 12-13 13z" fill="var(--color-green)" />
      </g>
    </svg>
  );
}
