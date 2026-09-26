function openAudioDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("minute-audio", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("recordings");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAudio(id: string, blob: Blob): Promise<void> {
  const db = await openAudioDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("recordings", "readwrite");
      tx.objectStore("recordings").put(blob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export async function loadAudio(id: string): Promise<Blob | undefined> {
  const db = await openAudioDatabase();
  try {
    return await new Promise<Blob | undefined>((resolve, reject) => {
      const request = db
        .transaction("recordings")
        .objectStore("recordings")
        .get(id);
      request.onsuccess = () =>
        resolve(request.result instanceof Blob ? request.result : undefined);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function deleteAudio(id: string): Promise<void> {
  const db = await openAudioDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("recordings", "readwrite");
      tx.objectStore("recordings").delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
