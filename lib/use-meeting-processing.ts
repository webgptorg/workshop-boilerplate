"use client";

import { useRef, useState } from "react";
import { authenticatedFetch } from "./supabase/browser";
import { getRecording } from "./media";
import { mutate } from "./store";
import { uid } from "./utils";
import type { Meeting, MeetingAnalysis, Todo } from "./types";
import { useMinute } from "@/components/minute-provider";

export function useMeetingProcessing(meeting: Meeting) {
  const { state, t, notify } = useMinute();
  const mutateAccount = (updater: Parameters<typeof mutate>[0]) => mutate(updater, state.user.id);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const lock = useRef(false);

  async function process() {
    if (lock.current) return false;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const segments: string[] = [];
      for (let i = 0; i < meeting.recordings.length; i++) {
        const recording = meeting.recordings[i];
        if (meeting.transcriptRecordingIds?.includes(recording.id)) continue;
        if (recording.transcript) {
          segments.push(recording.transcript);
          continue;
        }
        setProgress(`${t("Transcribing recording", "Přepisuji nahrávku")} ${i + 1}/${meeting.recordings.length}…`);
        const blob = await getRecording(recording.id);
        if (!blob) throw new Error("missing_recording");
        const form = new FormData();
        form.append("file", blob, recording.name);
        if (meeting.languages.length === 1) form.append("language", meeting.languages[0]);
        const response = await authenticatedFetch("/api/transcribe", { method: "POST", body: form });
        const result = await response.json();
        if (!response.ok && result.error === "not_configured" && recording.liveTranscript) result.text = recording.liveTranscript;
        else if (!response.ok) throw new Error(result.error);
        if (typeof result.text !== "string") throw new Error("transcription_failed");
        segments.push(result.text);
        mutateAccount((current) => ({
          ...current,
          meetings: current.meetings.map((item) =>
            item.id === meeting.id
              ? { ...item, recordings: item.recordings.map((rec) => (rec.id === recording.id ? { ...rec, transcript: result.text } : rec)) }
              : item,
          ),
        }));
      }
      const text = [meeting.transcript?.text?.trim(), ...segments].filter(Boolean).join("\n\n").trim();
      if (!text) throw new Error("no_speech");
      mutateAccount((current) => ({
        ...current,
        meetings: current.meetings.map((item) =>
          item.id === meeting.id
            ? {
                ...item,
                transcriptRecordingIds: meeting.recordings.map((rec) => rec.id),
                transcript: { text, summary: item.transcript?.summary ?? "", updatedAt: new Date().toISOString() },
              }
            : item,
        ),
      }));
      if (text !== meeting.processedText) {
        setProgress(t("Finding the next steps…", "Hledám další kroky…"));
        const response = await authenticatedFetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language: meeting.languages[0], date: meeting.date }),
        });
        const analysis = (await response.json()) as MeetingAnalysis & { error?: string };
        if (!response.ok) throw new Error(analysis.error);
        mutateAccount((current) => {
          const existing = new Set(
            current.todos.filter((todo) => todo.meetingIds.includes(meeting.id)).map((todo) => todo.title.toLocaleLowerCase().trim()),
          );
          const todos: Todo[] = analysis.todos
            .filter((todo) => !existing.has(todo.title.toLocaleLowerCase().trim()))
            .map((todo) => ({
              ...todo,
              id: uid(),
              workspaceId: meeting.workspaceId,
              meetingIds: [meeting.id],
              priority: "medium",
              completed: false,
              parentId: null,
              createdAt: new Date().toISOString(),
            }));
          return {
            ...current,
            todos: [...todos, ...current.todos],
            meetings: current.meetings.map((item) =>
              item.id === meeting.id
                ? {
                    ...item,
                    status: "completed",
                    processedText: text,
                    transcript: { text, summary: analysis.summary, updatedAt: new Date().toISOString() },
                    duration: item.recordings.length
                      ? Math.max(1, Math.round(item.recordings.reduce((sum, rec) => sum + rec.duration, 0) / 60))
                      : item.duration,
                  }
                : item,
            ),
          };
        });
      } else
        mutateAccount((current) => ({
          ...current,
          meetings: current.meetings.map((item) => (item.id === meeting.id ? { ...item, status: "completed" } : item)),
        }));
      notify(t("Meeting ready. Your next steps are waiting.", "Schůzka je připravena. Další kroky na vás čekají."));
      return true;
    } catch (reason) {
      const code = reason instanceof Error ? reason.message : "unknown";
      const message =
        code === "not_configured"
          ? t(
              "Automatic transcription needs an API connection. Your recordings are saved; you can add a transcript manually.",
              "Automatický přepis potřebuje připojení k API. Nahrávky jsou uložené; přepis můžete přidat ručně.",
            )
          : code === "no_speech"
            ? t(
                "No speech found. Add a recording or paste a transcript to continue.",
                "Nebyla nalezena řeč. Přidejte nahrávku nebo vložte přepis.",
              )
            : code === "missing_recording"
              ? t(
                  "A recording is missing from your account. Upload it again to continue.",
                  "Ve vašem účtu chybí nahrávka. Nahrajte ji znovu.",
                )
              : code === "rate_limit"
                ? t(
                    "The transcription service is busy. Your work is saved; try again shortly.",
                    "Služba je zaneprázdněná. Vaše práce je uložená; zkuste to za chvíli.",
                  )
                : t(
                    "Processing couldn’t finish. Your recordings and transcript are saved. Check your connection and try again.",
                    "Zpracování se nezdařilo. Nahrávky a přepis jsou uložené. Zkontrolujte připojení a zkuste to znovu.",
                  );
      setError(message);
      return false;
    } finally {
      setBusy(false);
      setProgress("");
      lock.current = false;
    }
  }
  return { busy, progress, error, process };
}
