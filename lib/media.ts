"use client";

import { browserSupabase } from "./supabase/browser";
const RECORDINGS_BUCKET = "recordings";

async function recordingStorage() {
  const client = browserSupabase();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new Error("Please sign in again.");
  return { bucket: client.storage.from(RECORDINGS_BUCKET), userId: data.user.id };
}

export async function saveRecording(id: string, blob: Blob) {
  const { bucket, userId } = await recordingStorage();
  const { error } = await bucket.upload(`${userId}/${id}`, blob, { contentType: blob.type || "application/octet-stream", upsert: false });
  if (error) throw new Error("Could not upload the recording. Check your connection and try again.");
}

export async function getRecording(id: string): Promise<Blob | undefined> {
  const { bucket, userId } = await recordingStorage();
  const { data, error } = await bucket.download(`${userId}/${id}`);
  if (error) throw new Error("Could not download the recording. Check your connection and try again.");
  return data ?? undefined;
}

export async function deleteRecordings(ids: string[]) {
  if (!ids.length) return;
  const { bucket, userId } = await recordingStorage();
  const { error } = await bucket.remove(ids.map((id) => `${userId}/${id}`));
  if (error) throw new Error("Could not delete the recordings. Please try again.");
}
