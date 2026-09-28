import { demoUsers, type Account } from "./types";

const DATABASE = "minute-recordings";
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("recordings");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function saveAudio(key: string, blob: Blob): Promise<void> {
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("recordings", "readwrite");
    tx.objectStore("recordings").put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  db.close();
}
export async function getAudio(key: string): Promise<Blob | undefined> {
  const db = await database();
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const request = db
      .transaction("recordings")
      .objectStore("recordings")
      .get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return blob;
}
export function getAccounts(): Account[] {
  try {
    return [
      ...demoUsers,
      ...(JSON.parse(
        localStorage.getItem("minute:accounts") || "[]",
      ) as Account[]),
    ];
  } catch {
    return [...demoUsers];
  }
}
export async function hashPassword(password: string): Promise<string> {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password),
  );
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export function audioKey(
  userId: string,
  workspaceId: string,
  recordingId: string,
) {
  return `${userId}:${workspaceId}:${recordingId}`;
}
