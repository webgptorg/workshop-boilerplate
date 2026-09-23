import type { ReactNode } from "react";

interface PageHeadingProps {
  readonly title: string;
  readonly children?: ReactNode;
}

export function PageHeading({ title, children }: PageHeadingProps) {
  return (
    <div className="page-heading">
      <h1>{title}</h1>
      {children}
    </div>
  );
}
