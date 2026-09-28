import type { ActionItem, Call, Language, Workspace } from "./types";
export function shortDate(date: string, language: Language = "en") {
  return new Date(date).toLocaleDateString(
    language === "cs" ? "cs-CZ" : "en-US",
    { month: "short", day: "numeric" },
  );
}
export function durationLabel(seconds: number) {
  if (seconds < 60) return `${Math.max(0, Math.round(seconds))}s`;
  const minutes = Math.round(seconds / 60);
  return minutes < 60
    ? `${minutes} min`
    : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
export function clockTime(seconds: number) {
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
}
export function uid() {
  return crypto.randomUUID();
}
export function draftNotes(
  transcript: string,
  language: Language,
): { notes: string; actions: string[]; summary: string } {
  const sentences = transcript
    .split(/\n+|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const actions = sentences
    .filter((s) =>
      /\b(will|need to|should|must|action|todo|follow up|next step)\b|připrav|aktualiz|potřeb|musíme|zaříd|naplán|pošl|uděl/i.test(
        s,
      ),
    )
    .slice(0, 8);
  const decisions = sentences
    .filter((s) => /decid|agreed|agree|rozhod|souhlas|domluv/i.test(s))
    .slice(0, 5);
  const summary = sentences.slice(0, 3).join(" ");
  const notes = `## ${language === "cs" ? "Shrnutí" : "Summary"}\n${summary}\n\n${decisions.length ? `## ${language === "cs" ? "Rozhodnutí" : "Decisions"}\n${decisions.map((s) => `- ${s}`).join("\n")}\n\n` : ""}${actions.length ? `## ${language === "cs" ? "Další kroky" : "Next steps"}\n${actions.map((s) => `- ${s}`).join("\n")}` : ""}`;
  return { notes, actions: [...new Set(actions)], summary };
}
function download(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function csvCell(value: string) {
  return `"${value.replace(/^[=+@-]/, "'$&").replaceAll('"', '""')}"`;
}
export function exportData(
  workspace: Workspace,
  format: "csv" | "md" | "pdf",
  call?: Call,
  actionsOnly = false,
) {
  const calls = call ? [call] : workspace.calls;
  const actions = call
    ? workspace.actions.filter((a) => a.callIds.includes(call.id))
    : workspace.actions;
  const name = (call?.title || workspace.name).replace(
    /[^\p{L}\p{N}\s-]/gu,
    "",
  );
  const actionLine = (a: ActionItem) =>
    `- [${a.completed ? "x" : " "}] ${a.title}${a.assignee ? ` — ${a.assignee}` : ""}${a.dueDate ? ` (${a.dueDate})` : ""}`;
  const md = `# ${call?.title || workspace.name}\n\n${actionsOnly ? "" : calls.map((c) => `## ${c.title}\n${shortDate(c.date)} · ${durationLabel(c.duration)}\n\n${c.notes}\n`).join("\n")}\n## Action items\n${actions.map(actionLine).join("\n")}`;
  if (format === "md")
    return download(md, `${name}.md`, "text/markdown;charset=utf-8");
  if (format === "csv") {
    const rows = actionsOnly
      ? [
          [
            "Title",
            "Completed",
            "Assignee",
            "Due date",
            "Calls",
            "Description",
          ],
          ...actions.map((a) => [
            a.title,
            String(a.completed),
            a.assignee,
            a.dueDate,
            a.callIds
              .map(
                (id) => workspace.calls.find((c) => c.id === id)?.title || id,
              )
              .join("; "),
            a.description,
          ]),
        ]
      : [
          [
            "Title",
            "Date",
            "Duration (seconds)",
            "Category",
            "Notes",
            "Action items",
          ],
          ...calls.map((c) => [
            c.title,
            c.date,
            String(c.duration),
            c.category,
            c.notes,
            actions
              .filter((a) => a.callIds.includes(c.id))
              .map((a) => a.title)
              .join("; "),
          ]),
        ];
    return download(
      "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n"),
      `${name}.csv`,
      "text/csv;charset=utf-8",
    );
  }
  const printWindow = window.open("", "_blank");
  if (!printWindow)
    throw new Error("Allow pop-ups to open the PDF print preview.");
  const escape = (s: string) =>
    s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  printWindow.document.write(
    `<!doctype html><html><head><title>${escape(name)} — Minute</title><style>body{font:14px/1.7 system-ui;color:#243e32;max-width:760px;margin:48px auto;padding:24px}h1{font:40px Georgia}pre{white-space:pre-wrap;font:inherit}@media print{body{margin:0;padding:0}button{display:none}}</style></head><body><h1>minute.</h1><pre>${escape(md)}</pre><button onclick="window.print()">Print / Save as PDF</button></body></html>`,
  );
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 250);
}
