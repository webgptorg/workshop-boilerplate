"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  ListTodo,
  Mic,
  Plus,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useMinute } from "./minute-provider";
import { MeetingCard } from "./meeting-card";
import { TodoRow } from "./todo-row";
import { Avatars, EmptyState, PageHeading, SectionHeading } from "./shared";
import { Button } from "./ui/button";
import { mutate } from "@/lib/store";
import { dateLabel, locale, timeLabel } from "@/lib/utils";
import type { Workspace } from "@/lib/types";

export function Dashboard({
  workspace,
  onNewMeeting,
  onNewTodo,
  onHelp,
}: {
  workspace: Workspace;
  onNewMeeting: (scheduled?: boolean) => void;
  onNewTodo: () => void;
  onHelp: () => void;
}) {
  const { state, t } = useMinute();
  const meetings = state.meetings.filter((item) => item.workspaceId === workspace.id);
  const completed = meetings.filter((item) => item.status === "completed").sort((a, b) => b.date.localeCompare(a.date));
  const upcoming = meetings.filter((item) => item.status !== "completed").sort((a, b) => a.date.localeCompare(b.date));
  const todos = state.todos.filter((item) => item.workspaceId === workspace.id);
  const pending = todos.filter((item) => !item.completed);
  const minutes = completed.reduce((sum, item) => sum + item.duration, 0);
  const tutorial = todos.filter((item) => item.id.startsWith("tutorial"));
  const tutorialDone = tutorial.filter((item) => item.completed).length;
  const stats = [
    {
      icon: AudioLines,
      color: "cyan",
      value: meetings.length,
      title: t("Total meetings", "Celkem schůzek"),
      note: `${completed.length} ${t("completed", "dokončeno")}`,
    },
    {
      icon: ListTodo,
      color: "purple",
      value: pending.length,
      title: t("Open todos", "Otevřené úkoly"),
      note: `${todos.filter((item) => item.completed).length} ${t("completed", "dokončeno")}`,
    },
    {
      icon: Clock3,
      color: "orange",
      value: `${Math.floor(minutes / 60)}h ${minutes % 60}m`,
      title: t("Meeting time", "Čas schůzek"),
      note: t("Across completed meetings", "Za dokončené schůzky"),
    },
  ];
  return (
    <>
      <PageHeading
        eyebrow={new Date().toLocaleDateString(locale(state.user.language), { weekday: "long", month: "long", day: "numeric" })}
        title={`${t("Welcome back", "Vítejte zpět")}, ${state.user.name.split(" ")[0]} 👋`}
        subtitle={t("Your meetings and next steps.", "Vaše schůzky a další kroky.")}
      >
        <Button onClick={() => onNewMeeting()}>
          <Plus size={18} />
          {t("New meeting", "Nová schůzka")}
        </Button>
      </PageHeading>
      <section className="welcome-banner">
        <div className="welcome-content">
          <span className="banner-eyebrow">
            <span />
            {t("BE PRESENT. WE’LL TAKE NOTES.", "BUĎTE U TOHO. POZNÁMKY NECHTE NA NÁS.")}
          </span>
          <h2>
            {t("Good conversations.", "Dobré rozhovory.")}
            <br />
            {t("Clear next steps.", "Jasné další kroky.")}
          </h2>
          <p>
            {t(
              "Record your meeting. Capture every detail. Turn ideas into action.",
              "Nahrajte schůzku. Zachyťte každý detail. Proměňte nápady v činy.",
            )}
          </p>
          <div className="banner-actions">
            <Button onClick={() => onNewMeeting()}>
              <Mic size={16} />
              {t("Start recording", "Začít nahrávat")}
            </Button>
            <button className="upload-action" onClick={() => onNewMeeting()}>
              <Upload size={15} />
              {t("Upload a recording", "Nahrát soubor")}
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
        <div className="conversation-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-orbit orbit-three" />
          <div className="art-tag tag-top">
            <span className="recording-dot" />
            {t("Every word, captured", "Každé slovo zachyceno")}
          </div>
          <div className="wave-card">
            <span className="wave-timestamp">00:24</span>
            <div className="hero-wave">
              {Array.from({ length: 31 }, (_, i) => (
                <i key={i} style={{ height: `${12 + Math.sin(i * 0.73) ** 2 * (28 + Math.sin(i * 0.2) ** 2 * 34)}px` }} />
              ))}
            </div>
            <span className="wave-play">
              <Mic size={17} />
            </span>
          </div>
          <div className="art-tag tag-bottom">
            <span className="art-check">
              <Check size={13} />
            </span>
            {t("Next steps, sorted", "Další kroky připraveny")}
            <Sparkles size={12} />
          </div>
          <span className="art-star star-one">✧</span>
          <span className="art-star star-two">✧</span>
        </div>
      </section>
      <div className="stats-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.title}>
            <div className={`stat-icon ${stat.color}`}>
              <stat.icon size={21} strokeWidth={1.7} />
            </div>
            <div className="stat-info">
              <span>{stat.title}</span>
              <strong>{stat.value}</strong>
            </div>
            <div className="stat-note">{stat.note}</div>
          </div>
        ))}
      </div>
      <section className="recent-section">
        <SectionHeading title={t("Recent meetings", "Poslední schůzky")} href={`/${workspace.id}/meetings`} />
        {completed.length ? (
          <div className="meeting-grid">
            {completed.slice(0, 3).map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={t("Your next conversation belongs here", "Váš další rozhovor patří sem")}
            description={t("Record a meeting to start your collection.", "Nahrajte schůzku a začněte svou sbírku.")}
            action={t("New meeting", "Nová schůzka")}
            onAction={() => onNewMeeting()}
          />
        )}
      </section>
      <div className="dashboard-bottom">
        <section>
          <SectionHeading title={t("Your next steps", "Vaše další kroky")} count={pending.length} href={`/${workspace.id}/todos`} />
          <div className="todo-panel">
            {pending.slice(0, 4).map((todo) => (
              <TodoRow key={todo.id} todo={todo} compact />
            ))}
            {!pending.length && (
              <div className="all-done">
                <Check size={25} />
                <p>{t("All caught up. Take a breath.", "Vše hotovo. Chvilka pro vás.")}</p>
              </div>
            )}
            <button className="add-todo-row" onClick={onNewTodo}>
              <Plus size={16} />
              {t("Add a todo", "Přidat úkol")}
            </button>
          </div>
        </section>
        <section>
          <SectionHeading title={t("Coming up", "Co vás čeká")}>
            <button className="icon-button" onClick={() => onNewMeeting(true)} aria-label={t("Schedule meeting", "Naplánovat schůzku")}>
              <Plus size={17} />
            </button>
          </SectionHeading>
          <div className="upcoming-panel">
            {upcoming.length ? (
              upcoming.slice(0, 2).map((meeting, index) => (
                <div className={`upcoming-meeting ${index === 0 ? "upcoming-featured" : ""}`} key={meeting.id}>
                  <div className="upcoming-date">
                    <span className="date-pill">
                      <CalendarDays size={12} />
                      {dateLabel(meeting.date, state.user.language)}
                    </span>
                    <span>{timeLabel(meeting.date, state.user.language)}</span>
                  </div>
                  <Link className="upcoming-title" href={`/${workspace.id}/meetings/${meeting.id}`}>
                    {meeting.title}
                    <ChevronRight size={16} />
                  </Link>
                  <div className="upcoming-footer">
                    <Avatars names={meeting.participants} />
                    <span>{meeting.duration} min</span>
                  </div>
                  {index === 0 && (
                    <Link className="studio-link" href={`/${workspace.id}/meetings/${meeting.id}/studio`}>
                      <Mic size={14} />
                      {t("Open meeting studio", "Otevřít studio")}
                      <ArrowRight size={15} />
                    </Link>
                  )}
                </div>
              ))
            ) : (
              <div className="compact-empty">
                <CalendarDays size={25} />
                <p>{t("No upcoming meetings.", "Žádné nadcházející schůzky.")}</p>
                <button className="text-link" onClick={() => onNewMeeting(true)}>
                  {t("Schedule a meeting", "Naplánovat schůzku")}
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
      {!state.onboardingDismissed && tutorial.length > 0 && (
        <div className="onboarding-bar">
          <span className="onboarding-icon">
            <Sparkles size={20} />
          </span>
          <div>
            <strong>{t("Make yourself at home", "Zabydlete se")}</strong>
            <span>{t("Three steps to get started.", "Tři kroky do začátku.")}</span>
          </div>
          <div className="onboarding-progress">
            <span>{tutorialDone}/3</span>
            <div>
              <i style={{ width: `${(tutorialDone / 3) * 100}%` }} />
            </div>
          </div>
          <button className="text-link" onClick={onHelp}>
            {t("Let’s go", "Začínáme")}
            <ArrowRight size={15} />
          </button>
          <button
            className="icon-button"
            aria-label={t("Dismiss tutorial", "Skrýt průvodce")}
            onClick={() => mutate((current) => ({ ...current, onboardingDismissed: true }))}
          >
            <X size={15} />
          </button>
        </div>
      )}
      <footer className="page-footer">
        <span>
          <span className="tiny-dot" />
          {t("Saved on this device", "Uloženo na tomto zařízení")}
        </span>
        <span>Minute</span>
      </footer>
    </>
  );
}
