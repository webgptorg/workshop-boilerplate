import type { AppState } from "./types";

const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length <= 10_000 && value.every((item) => typeof item === "string" && item.length <= 200_000);
const text = (value: unknown): value is string => typeof value === "string" && value.length <= 200_000;
const id = (value: unknown) => typeof value === "string" && /^[\w-]{1,100}$/.test(value);
const date = (value: unknown) => typeof value === "string" && Number.isFinite(Date.parse(value));
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) && value >= 0;
const oneOf = (value: unknown, values: string[]) => typeof value === "string" && values.includes(value);
const languages = (value: unknown) =>
  strings(value) && value.length > 0 && value.length <= 2 && value.every((item) => item === "en" || item === "cs");
const uniqueIds = (items: { id: string }[]) => new Set(items.map((item) => item.id)).size === items.length;

function workspace(value: unknown) {
  return (
    object(value) &&
    id(value.id) &&
    text(value.name) &&
    !!value.name &&
    text(value.description) &&
    languages(value.languages) &&
    text(value.color) &&
    date(value.createdAt)
  );
}

function recording(value: unknown) {
  return (
    object(value) &&
    id(value.id) &&
    text(value.name) &&
    text(value.mimeType) &&
    number(value.size) &&
    number(value.duration) &&
    date(value.createdAt) &&
    (value.transcript === undefined || text(value.transcript)) &&
    (value.liveTranscript === undefined || text(value.liveTranscript))
  );
}

function meeting(value: unknown) {
  return (
    object(value) &&
    id(value.id) &&
    id(value.workspaceId) &&
    text(value.title) &&
    !!value.title &&
    text(value.description) &&
    date(value.date) &&
    number(value.duration) &&
    strings(value.participants) &&
    languages(value.languages) &&
    oneOf(value.status, ["scheduled", "in-progress", "completed"]) &&
    oneOf(value.color, ["cyan", "purple", "orange", "green"]) &&
    Array.isArray(value.recordings) &&
    value.recordings.every(recording) &&
    (value.processedText === undefined || text(value.processedText)) &&
    (value.transcriptRecordingIds === undefined || strings(value.transcriptRecordingIds)) &&
    (value.transcript === undefined ||
      (object(value.transcript) && text(value.transcript.text) && text(value.transcript.summary) && date(value.transcript.updatedAt)))
  );
}

function todo(value: unknown) {
  return (
    object(value) &&
    id(value.id) &&
    id(value.workspaceId) &&
    text(value.title) &&
    !!value.title &&
    text(value.description) &&
    typeof value.completed === "boolean" &&
    oneOf(value.priority, ["low", "medium", "high"]) &&
    date(value.createdAt) &&
    (value.parentId === null || id(value.parentId)) &&
    strings(value.meetingIds) &&
    (value.dueDate === "" || (typeof value.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.dueDate) && date(value.dueDate)))
  );
}

// Validate both shape and relationships before replacing a user's saved work.
export function isAppState(value: unknown): value is AppState {
  if (!object(value) || value.version !== 1 || !object(value.user)) return false;
  const user = value.user;
  if (
    !id(user.id) ||
    !text(user.name) ||
    user.name.length > 80 ||
    !text(user.email) ||
    user.email.length > 254 ||
    !oneOf(user.language, ["en", "cs"]) ||
    !oneOf(user.theme, ["light", "dark", "system"])
  )
    return false;
  if (typeof value.onboardingDismissed !== "boolean") return false;
  if (!Array.isArray(value.workspaces) || !value.workspaces.length || !value.workspaces.every(workspace)) return false;
  if (!Array.isArray(value.meetings) || !value.meetings.every(meeting) || !Array.isArray(value.todos) || !value.todos.every(todo))
    return false;
  if (
    !Array.isArray(value.memberships) ||
    !value.memberships.every((item) => object(item) && id(item.userId) && id(item.workspaceId) && oneOf(item.role, ["owner", "member"]))
  )
    return false;
  const data = value as unknown as AppState;
  if (
    !uniqueIds(data.workspaces) ||
    !uniqueIds(data.meetings) ||
    !uniqueIds(data.todos) ||
    !uniqueIds(data.meetings.flatMap((item) => item.recordings))
  )
    return false;
  const workspaceIds = new Set(data.workspaces.map((item) => item.id));
  const meetings = new Map(data.meetings.map((item) => [item.id, item]));
  const todos = new Map(data.todos.map((item) => [item.id, item]));
  if (!data.memberships.every((item) => workspaceIds.has(item.workspaceId) && item.userId === data.user.id)) return false;
  if (!data.workspaces.every((item) => data.memberships.some((member) => member.workspaceId === item.id))) return false;
  if (!data.meetings.every((item) => workspaceIds.has(item.workspaceId))) return false;
  return data.todos.every((item) => {
    if (
      !workspaceIds.has(item.workspaceId) ||
      !item.meetingIds.every((meetingId) => meetings.get(meetingId)?.workspaceId === item.workspaceId)
    )
      return false;
    const visited = new Set([item.id]);
    let parentId = item.parentId;
    while (parentId) {
      const parent = todos.get(parentId);
      if (!parent || visited.has(parentId) || parent.workspaceId !== item.workspaceId) return false;
      visited.add(parentId);
      parentId = parent.parentId;
    }
    return true;
  });
}
