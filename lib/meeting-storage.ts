import type { Meeting } from "@/lib/meetings";

const meetingsKey = "minute-meetings-v1";
const databaseName = "minute-recordings";
const storeName = "audio";

export function loadMeetings(): Meeting[] {
  try {
    const saved = JSON.parse(
      localStorage.getItem(meetingsKey) ?? "[]",
    ) as unknown;
    return Array.isArray(saved) ? (saved as Meeting[]) : [];
  } catch {
    return [];
  }
}

export function saveMeetings(meetings: Meeting[]): void {
  localStorage.setItem(meetingsKey, JSON.stringify(meetings));
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) {
        request.result.createObjectStore(storeName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function audioRequest<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const request = action(transaction.objectStore(storeName));
    transaction.oncomplete = () => {
      database.close();
      resolve(request.result);
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

export async function saveAudio(id: string, audio: Blob): Promise<void> {
  await audioRequest("readwrite", (store) => store.put(audio, id));
}

export async function loadAudio(id: string): Promise<Blob | undefined> {
  return audioRequest(
    "readonly",
    (store) => store.get(id) as IDBRequest<Blob | undefined>,
  );
}

export async function deleteAudio(id: string): Promise<void> {
  await audioRequest("readwrite", (store) => store.delete(id));
}
