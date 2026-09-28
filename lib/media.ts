"use client";

import { createClient } from "./supabase/client";

const RECORDINGS_BUCKET = "recordings";

async function recordingPath(id: string) {
  const { data, error } = await createClient().auth.getUser();
  if (error || !data.user) throw new Error("Sign in to access recordings.");
  return `${data.user.id}/${id}`;
}

export async function saveRecording(id: string, blob: Blob) {
  const path = await recordingPath(id);
  const { error } = await createClient().storage.from(RECORDINGS_BUCKET).upload(path, blob, {
    contentType: blob.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(`Could not save the recording: ${error.message}`);
}

export async function getRecording(id: string): Promise<Blob | undefined> {
  const path = await recordingPath(id);
  const { data, error } = await createClient().storage.from(RECORDINGS_BUCKET).download(path);
  if (error) {
    if (error.message.includes("not found") || error.message.includes("Not Found")) return undefined;
    throw new Error(`Could not load the recording: ${error.message}`);
  }
  return data;
}

export async function deleteRecordings(ids: string[]) {
  if (!ids.length) return;
  const paths = await Promise.all(ids.map(recordingPath));
  const { error } = await createClient().storage.from(RECORDINGS_BUCKET).remove(paths);
  if (error) throw new Error(`Could not delete recordings: ${error.message}`);
}
