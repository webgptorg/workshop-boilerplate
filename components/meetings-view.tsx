"use client";

import { useState } from "react";
import Link from "next/link";
import { AudioLines, CalendarDays, LayoutGrid, List, Plus, Search } from "lucide-react";
import { useMinute } from "./minute-provider";
import { MeetingCard } from "./meeting-card";
import { Avatars, EmptyState, PageHeading, StatusBadge } from "./shared";
import { Button } from "./ui/button";
import { dateLabel, timeLabel } from "@/lib/utils";

export function MeetingsView({ workspaceId, onNewMeeting }: { workspaceId: string; onNewMeeting: (scheduled?: boolean) => void }) {
  const { state, t } = useMinute();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [layout, setLayout] = useState("grid");
  const meetings = state.meetings.filter((item) => item.workspaceId === workspaceId);
  const filtered = meetings
    .filter(
      (item) =>
        (filter === "all" || (filter === "upcoming" ? item.status !== "completed" : item.status === "completed")) &&
        `${item.title} ${item.description} ${item.participants.join(" ")}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => (filter === "upcoming" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));
  return (
    <>
      <PageHeading
        eyebrow={t("ROOM FOR EVERY CONVERSATION", "PROSTOR PRO KAŽDÝ ROZHOVOR")}
        title={t("Meetings", "Schůzky")}
        subtitle={t("The conversations, the context, and everything that comes next.", "Rozhovory, souvislosti a vše, co přijde potom.")}
      >
        <Button variant="secondary" onClick={() => onNewMeeting(true)}>
          <CalendarDays size={16} />
          {t("Schedule", "Naplánovat")}
        </Button>
        <Button onClick={() => onNewMeeting()}>
          <Plus size={17} />
          {t("New meeting", "Nová schůzka")}
        </Button>
      </PageHeading>
      <div className="view-toolbar">
        <div className="filter-tabs">
          {[
            { id: "all", label: t("All meetings", "Všechny schůzky"), count: meetings.length },
            { id: "upcoming", label: t("Upcoming", "Nadcházející"), count: meetings.filter((m) => m.status !== "completed").length },
            { id: "completed", label: t("Completed", "Dokončené"), count: meetings.filter((m) => m.status === "completed").length },
          ].map((tab) => (
            <button key={tab.id} className={filter === tab.id ? "active" : ""} onClick={() => setFilter(tab.id)}>
              {tab.label}
              <span>{tab.count}</span>
            </button>
          ))}
        </div>
        <div className="layout-toggle">
          <button
            aria-label={t("Grid view", "Mřížka")}
            aria-pressed={layout === "grid"}
            className={layout === "grid" ? "active" : ""}
            onClick={() => setLayout("grid")}
          >
            <LayoutGrid size={17} />
          </button>
          <button
            aria-label={t("List view", "Seznam")}
            aria-pressed={layout === "list"}
            className={layout === "list" ? "active" : ""}
            onClick={() => setLayout("list")}
          >
            <List size={18} />
          </button>
        </div>
      </div>
      <div className="list-tools">
        <div className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Find a meeting…", "Najít schůzku…")}
            aria-label={t("Search meetings", "Hledat schůzky")}
          />
        </div>
        <span className="muted small-text">
          {filtered.length} {t("meetings", "schůzek")}
        </span>
      </div>
      {filtered.length ? (
        layout === "grid" ? (
          <div className="meeting-grid meeting-grid-full">
            {filtered.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        ) : (
          <div className="meeting-list">
            {filtered.map((meeting) => (
              <Link key={meeting.id} href={`/${workspaceId}/meetings/${meeting.id}`}>
                <span className={`meeting-symbol ${meeting.color}`}>
                  <AudioLines size={21} />
                </span>
                <div>
                  <strong>{meeting.title}</strong>
                  <span>
                    {dateLabel(meeting.date, state.user.language)} · {timeLabel(meeting.date, state.user.language)} · {meeting.duration} min
                  </span>
                </div>
                <Avatars names={meeting.participants} />
                <StatusBadge status={meeting.status} />
              </Link>
            ))}
          </div>
        )
      ) : (
        <EmptyState
          title={
            query
              ? t("No meetings found", "Žádné schůzky nenalezeny")
              : t("Make room for a good conversation", "Udělejte prostor pro dobrý rozhovor")
          }
          description={
            query
              ? t("Try another search or switch the filter.", "Zkuste jiné hledání nebo změňte filtr.")
              : t("Schedule ahead or start recording right now.", "Naplánujte schůzku nebo začněte rovnou nahrávat.")
          }
          action={t("New meeting", "Nová schůzka")}
          onAction={() => onNewMeeting()}
        />
      )}
    </>
  );
}
