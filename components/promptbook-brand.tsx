import Link from "next/link";

export function PromptbookBrand() {
  return (
    <Link className="brand" href="/" aria-label="Callbook homepage">
      <span className="brand-name">Promptbook</span>
      <span className="brand-label">Callbook</span>
    </Link>
  );
}
