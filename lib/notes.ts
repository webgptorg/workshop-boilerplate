import * as Y from "yjs";

export const WELCOME_TITLE = "Welcome to your little space";
export const WELCOME_BODY = `A fresh page. A few thoughts. Something good in the making.

Notes is a simple space for whatever’s on your mind. A bright idea, a messy first draft, a plan you’re figuring out together.

Make yourself at home

→  Click anywhere and start writing.
→  Invite someone with your room link.
→  Watch your thoughts come together, in real time.

No accounts. No save button. Just you, your words, and a little room to think.

What will you make today?`;

export type Identity = { name: string; color: string; colorLight: string };
export type SavedRoom = {
  id: string;
  title: string;
  starred: boolean;
  visited: number;
  welcome?: boolean;
};
export type SyncStatus = "connecting" | "saved" | "saving" | "offline";
export type RoomMessage = { type: "document" | "awareness"; data: string };

export function createIdentity(): Identity {
  const adjectives = [
    "Cozy",
    "Curious",
    "Sunny",
    "Thoughtful",
    "Happy",
    "Little",
    "Gentle",
    "Brave",
  ];
  const colors = [
    "#ae6b48",
    "#678373",
    "#8972b7",
    "#4b8ba8",
    "#c38c35",
    "#ba6477",
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return {
    name: `${adjectives[Math.floor(Math.random() * adjectives.length)]} Hedgehog`,
    color,
    colorLight: `${color}26`,
  };
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function validRoomId(id: string) {
  return /^[a-zA-Z0-9_-]{8,80}$/.test(id);
}

export function encodeBytes(bytes: Uint8Array): string {
  if (typeof window === "undefined")
    return Buffer.from(bytes).toString("base64");
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function decodeBytes(value: string): Uint8Array {
  if (typeof window === "undefined")
    return new Uint8Array(Buffer.from(value, "base64"));
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

/** Change only the differing span so concurrent edits keep their CRDT positions. */
export function replaceText(text: Y.Text, next: string) {
  const previous = text.toString();
  if (previous === next) return;
  let start = 0;
  while (
    start < previous.length &&
    start < next.length &&
    previous[start] === next[start]
  )
    start++;
  let end = 0;
  while (
    end < previous.length - start &&
    end < next.length - start &&
    previous[previous.length - end - 1] === next[next.length - end - 1]
  )
    end++;
  text.doc?.transact(() => {
    if (previous.length - start - end)
      text.delete(start, previous.length - start - end);
    const insert = next.slice(start, next.length - end);
    if (insert) text.insert(start, insert);
  }, "local-title");
}
