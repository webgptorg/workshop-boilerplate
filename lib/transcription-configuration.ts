// This is the upstream provider's per-request limit, independent of local uploads.
// https://developers.openai.com/api/docs/guides/speech-to-text
export const MAX_TRANSCRIPTION_FILE_SIZE_MB = 25;
export const MAX_TRANSCRIPTION_FILE_SIZE_BYTES = MAX_TRANSCRIPTION_FILE_SIZE_MB * 1024 * 1024;
export const MAX_TRANSCRIPTION_REQUEST_SIZE_BYTES = MAX_TRANSCRIPTION_FILE_SIZE_BYTES + 1024 * 1024;
