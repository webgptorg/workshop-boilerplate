import { getSupabase } from "./supabase";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    void getSupabase().auth.getSession().then(({ data }) => {
      if (!data.session) throw new Error("Sign in to access recordings.");
      const request = indexedDB.open(`minute-media-${data.session.user.id}`, 1);
      request.onupgradeneeded = () => request.result.createObjectStore("recordings");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error("Could not open recording storage."));
    }).catch(reject);
  });
}

export async function saveRecording(id: string, blob: Blob) {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("recordings", "readwrite");
      transaction.objectStore("recordings").put(blob, id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error("Could not save the recording. Check your device storage."));
      transaction.onabort = () => reject(new Error("Recording storage was interrupted."));
    });
  } finally {
    database.close();
  }
}

export async function getRecording(id: string): Promise<Blob | undefined> {
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = database.transaction("recordings").objectStore("recordings").get(id);
        request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error("Could not load the recording."));
    });
  } finally {
    database.close();
  }
}

export async function deleteRecordings(ids: string[]) {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("recordings", "readwrite");
      ids.forEach((id) => transaction.objectStore("recordings").delete(id));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error("Could not remove recording files."));
    });
  } finally {
    database.close();
  }
}
