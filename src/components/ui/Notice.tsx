import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type NoticeTone = "info" | "success" | "danger";

interface NoticeProps {
  readonly tone?: NoticeTone;
  readonly children: ReactNode;
}

export function Notice({ tone = "info", children }: NoticeProps) {
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("notice", `notice-${tone}`)}>
      {children}
    </div>
  );
}
