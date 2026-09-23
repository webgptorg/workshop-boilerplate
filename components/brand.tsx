import Link from "next/link";
export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Společný stůl – úvod">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle
          cx="32"
          cy="32"
          r="29"
          fill="none"
          stroke="#a6b096"
          strokeWidth="1.6"
        />
        <path
          d="M20 48h26M33 47V29m0 10c-12 0-16-7-15-12 9-4 17 2 15 12Zm0-9c-2-13 6-17 14-16 2 9-4 16-14 16Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>společný stůl</span>
    </Link>
  );
}
