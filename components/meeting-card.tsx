"use client";

import Link from "next/link";
import { ArrowUpRight, AudioLines, CalendarDays, FileText } from "lucide-react";
import type { Meeting } from "@/lib/types";
import { dateLabel } from "@/lib/utils";
import { useMinute } from "./minute-provider";
import { Avatars, Duration, StatusBadge } from "./shared";
import { Card } from "./ui/card";

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  const { state, t } = useMinute();
  const todos = state.todos.filter((todo) => todo.meetingIds.includes(meeting.id));
  return (
    <Card className="meeting-card">
      <div className="meeting-card-top">
        <span className={`meeting-symbol ${meeting.color}`}>
          <AudioLines size={21} strokeWidth={1.7} />
        </span>
        <StatusBadge status={meeting.status} />
        <Link
          href={`/${meeting.workspaceId}/meetings/${meeting.id}`}
          className="meeting-open"
          aria-label={`${t("Open", "Otevřít")} ${meeting.title}`}
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>
      <Link href={`/${meeting.workspaceId}/meetings/${meeting.id}`} className="meeting-title">
        {meeting.title}
      </Link>
      <div className="meeting-meta">
        <span className="meta-item">
          <CalendarDays size={13} />
          {dateLabel(meeting.date, state.user.language)}
        </span>
        <span className="meta-separator">·</span>
        <Duration minutes={meeting.duration} />
      </div>
      <div className="meeting-card-footer">
        <Avatars names={meeting.participants} />
        <span className="card-todo-count">
          <FileText size={13} />
          {todos.length} {t("todos", "úkolů")}
        </span>
      </div>
    </Card>
  );
}
