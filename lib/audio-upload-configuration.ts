const DEFAULT_MAX_AUDIO_UPLOAD_SIZE_MB = 500;
const DEFAULT_MAX_AUDIO_UPLOAD_DURATION_HOURS = 5;
const BYTES_PER_MEGABYTE = 1024 * 1024;
const SECONDS_PER_HOUR = 60 * 60;

function positiveSetting(value: string | undefined, fallback: number, name: string, multiplier: number): number {
  if (!value?.trim()) return fallback;
  const NUMBER = Number(value);
  if (!Number.isFinite(NUMBER) || NUMBER <= 0 || NUMBER > Number.MAX_SAFE_INTEGER / multiplier) {
    throw new Error(`${name} must be a finite, positive number.`);
  }
  return NUMBER;
}

export function getAudioUploadLimits(
  sizeMegabytes = process.env.NEXT_PUBLIC_MAX_AUDIO_UPLOAD_SIZE_MB,
  durationHours = process.env.NEXT_PUBLIC_MAX_AUDIO_UPLOAD_DURATION_HOURS,
) {
  const MAX_SIZE_MB = positiveSetting(sizeMegabytes, DEFAULT_MAX_AUDIO_UPLOAD_SIZE_MB, "NEXT_PUBLIC_MAX_AUDIO_UPLOAD_SIZE_MB", BYTES_PER_MEGABYTE);
  const MAX_DURATION_HOURS = positiveSetting(durationHours, DEFAULT_MAX_AUDIO_UPLOAD_DURATION_HOURS, "NEXT_PUBLIC_MAX_AUDIO_UPLOAD_DURATION_HOURS", SECONDS_PER_HOUR);
  return {
    maxSizeMegabytes: MAX_SIZE_MB,
    maxSizeBytes: MAX_SIZE_MB * BYTES_PER_MEGABYTE,
    maxDurationHours: MAX_DURATION_HOURS,
    maxDurationSeconds: MAX_DURATION_HOURS * SECONDS_PER_HOUR,
  };
}

export const AUDIO_UPLOAD_LIMITS = getAudioUploadLimits();

export function isAudioUploadSizeAllowed(sizeBytes: number, limits = AUDIO_UPLOAD_LIMITS): boolean {
  return Number.isFinite(sizeBytes) && sizeBytes > 0 && sizeBytes <= limits.maxSizeBytes;
}

export function isAudioUploadDurationAllowed(durationSeconds: number, limits = AUDIO_UPLOAD_LIMITS): boolean {
  return Number.isFinite(durationSeconds) && durationSeconds > 0 && durationSeconds <= limits.maxDurationSeconds;
}
