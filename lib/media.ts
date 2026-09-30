import { getBrowserSupabase } from "./supabase/browser";

const RECORDINGS_BUCKET = "recordings";
const MAX_RECORDING_BYTES = 25 * 1024 * 1024;

async function recordingPath(id: string) {
  if (!/^[\w-]{1,100}$/.test(id)) throw new Error("Invalid recording ID.");
  const { data, error } = await getBrowserSupabase().auth.getUser();
  if (error || !data.user) throw new Error("Sign in to access recordings.");
  return `${data.user.id}/${id}`;
}

export async function saveRecording(id: string, blob: Blob) {
  if (!blob.size || blob.size > MAX_RECORDING_BYTES) throw new Error("Recordings must be between 1 byte and 25 MB.");
  const { error } = await getBrowserSupabase().storage.from(RECORDINGS_BUCKET).upload(await recordingPath(id), blob, {
    contentType: blob.type || "application/octet-stream", upsert: false,
  });
  if (error) throw new Error("Could not upload the recording. Check your connection and retry.");
}

export async function getRecording(id: string): Promise<Blob | undefined> {
  const { data, error } = await getBrowserSupabase().storage.from(RECORDINGS_BUCKET).download(await recordingPath(id));
  if (error) throw new Error("Could not load the recording. Check your connection.");
  return data ?? undefined;
}

export async function deleteRecordings(ids: string[]) {
  if (!ids.length) return;
  const paths = await Promise.all(ids.map(recordingPath));
  const { error } = await getBrowserSupabase().storage.from(RECORDINGS_BUCKET).remove(paths);
  if (error) throw new Error("Could not remove recording files. Check your connection and retry.");
}
