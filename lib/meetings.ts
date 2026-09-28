export type ActionItem = {
  id: string;
  text: string;
  done: boolean;
};

export type Meeting = {
  id: string;
  title: string;
  createdAt: string;
  duration: number;
  transcript: string;
  summary: string;
  actions: ActionItem[];
  hasAudio: boolean;
  audioType?: string;
};

const actionPattern =
  /\b(?:will|need(?:s)? to|should|must|to-?do|action item|follow up|send|share|prepare|review|update|schedule|confirm|draft|finalize|check|create|ship|fix|assign)\b/i;

export function createNotes(
  transcript: string,
): Pick<Meeting, "summary" | "actions"> {
  const sentences = transcript
    .replace(/\s+(?=[A-Z][a-z]+ (?:will|needs? to|should|must)\b)/g, ". ")
    .replace(/[ \t]+/g, " ")
    .split(/(?<=[.!?])\s+|(?:\s*[;•]\s*)|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 8);

  const unique = [...new Set(sentences)];
  const summarySentences = unique
    .filter((sentence) => !actionPattern.test(sentence))
    .slice(0, 3);
  const fallback = unique.slice(0, 3);

  return {
    summary: (summarySentences.length ? summarySentences : fallback).join(" "),
    actions: unique
      .filter((sentence) => actionPattern.test(sentence))
      .slice(0, 8)
      .map((text) => ({ id: crypto.randomUUID(), text, done: false })),
  };
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function formatMeetingDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
