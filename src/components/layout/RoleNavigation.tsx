"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export interface NavigationItem {
  readonly href: string;
  readonly label: string;
}

export function RoleNavigation({ items }: { readonly items: readonly NavigationItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="role-navigation" aria-label="Sekce">
      <div className="container role-navigation-inner">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn("role-navigation-link", pathname === item.href && "is-active")}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
