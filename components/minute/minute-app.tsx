"use client";
import Link from "next/link";
import { useState } from "react";
import { MinuteProvider, useMinute } from "./provider";
import { Shell } from "./shell";
import { Auth } from "./auth";
import { Overview } from "./overview";
import { Calls } from "./calls";
import { Actions, ActionDetail } from "./actions";
import { CallDetail } from "./call-detail";
import { RecordingStudio } from "./recording-studio";
import { Settings } from "./settings";
import { EmptyState } from "./shared";
function AppContent({ view }: { view: string[] }) {
  const { user, workspace, ready, t } = useMinute();
  const [actionId, setActionId] = useState<string | null>(null);
  const page = view[0] || "overview";
  const isDetail = page === "calls" && Boolean(view[1]);
  if (!user) return <Auth />;
  const content = !workspace ? (
    <EmptyState
      title={
        ready
          ? t(
              "This workspace couldn’t be found.",
              "Tento pracovní prostor nebyl nalezen.",
            )
          : t("Opening your workspace…", "Otevírání prostoru…")
      }
    >
      <Link href="/personal" className="button button-primary">
        {t("Personal workspace", "Osobní prostor")}
      </Link>
    </EmptyState>
  ) : isDetail ? (
    <CallDetail
      key={`${workspace.id}-${view[1]}-${user.id}-${ready}`}
      id={view[1]}
      onAction={setActionId}
    />
  ) : page === "overview" ? (
    <Overview onAction={setActionId} />
  ) : page === "calls" ? (
    <Calls />
  ) : page === "favorites" ? (
    <Calls favorites />
  ) : page === "actions" ? (
    <Actions onOpen={setActionId} />
  ) : page === "recording" ? (
    <RecordingStudio />
  ) : page === "settings" ? (
    <Settings key={`${workspace.id}-${user.id}-${ready}`} />
  ) : (
    <EmptyState
      title={t("This page couldn’t be found.", "Tato stránka nebyla nalezena.")}
    >
      <Link href={`/${workspace.id}`}>
        {t("Back to overview", "Zpět na přehled")}
      </Link>
    </EmptyState>
  );
  return (
    <Shell page={isDetail ? "call" : page} onAction={setActionId}>
      {content}
      {actionId && (
        <ActionDetail
          key={actionId}
          id={actionId}
          onClose={() => setActionId(null)}
          onOpen={setActionId}
        />
      )}
    </Shell>
  );
}
export function MinuteApp({
  workspaceId = "personal",
  view = [],
}: {
  workspaceId?: string;
  view?: string[];
}) {
  return (
    <MinuteProvider workspaceId={workspaceId}>
      <AppContent view={view} />
    </MinuteProvider>
  );
}
