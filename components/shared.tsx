"use client";

import { ArrowUpRight, Check, Clock3, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useMinute } from "./minute-provider";
import { initials } from "@/lib/utils";
import type { MeetingStatus } from "@/lib/types";
import { Button } from "./ui/button";

export function Avatar({ name, index = 0, small = false }: { name: string; index?: number; small?: boolean }) {
  return (
    <span className={`avatar avatar-${index % 5} ${small ? "avatar-small" : ""}`} title={name}>
      {initials(name)}
    </span>
  );
}

export function Avatars({ names, limit = 3 }: { names: string[]; limit?: number }) {
  const { t } = useMinute();
  return (
    <div className="avatar-group" aria-label={names.join(", ")}>
      {names.slice(0, limit).map((name, index) => (
        <Avatar key={`${name}-${index}`} name={name} index={index} small />
      ))}
      {names.length > limit && <span className="avatar avatar-small avatar-more">+{names.length - limit}</span>}
      {!names.length && <span className="muted small-text">{t("Just you", "Jen vy")}</span>}
    </div>
  );
}

export function StatusBadge({ status }: { status: MeetingStatus }) {
  const { t } = useMinute();
  return (
    <span className={`status-badge status-${status}`}>
      <span />
      {status === "completed"
        ? t("Completed", "Dokončeno")
        : status === "scheduled"
          ? t("Upcoming", "Nadcházející")
          : t("In progress", "Probíhá")}
    </span>
  );
}

export function PageHeading({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}

export function SectionHeading({
  title,
  count,
  href,
  children,
}: {
  title: string;
  count?: number;
  href?: string;
  children?: React.ReactNode;
}) {
  const { t } = useMinute();
  return (
    <div className="section-heading">
      <h2>
        {title}
        {count !== undefined && <span className="count-badge">{count}</span>}
      </h2>
      {href && (
        <Link href={href} className="text-link">
          {t("View all", "Zobrazit vše")}
          <ArrowUpRight size={15} />
        </Link>
      )}
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  onAction,
  type = "meeting",
}: {
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
  type?: "meeting" | "todo";
}) {
  const Icon = type === "meeting" ? FileText : Check;
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={27} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && (
        <Button onClick={onAction}>
          <Plus size={16} />
          {action}
        </Button>
      )}
    </div>
  );
}

export function Duration({ minutes }: { minutes: number }) {
  const { t } = useMinute();
  return (
    <span className="meta-item">
      <Clock3 size={13} />
      {minutes} {t("min", "min")}
    </span>
  );
}
