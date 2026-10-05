const METADATA_TIMEOUT_MS = 15_000;

// Inspect metadata without decoding the whole recording into memory.
export function getAudioFileDuration(file: File): Promise<number | null> {
  const URL = globalThis.URL.createObjectURL(file);
  return new Promise((resolve) => {
    const AUDIO = new Audio();
    AUDIO.preload = "metadata";
    const finish = (duration: number | null) => {
      clearTimeout(TIMEOUT);
      AUDIO.onloadedmetadata = null;
      AUDIO.ondurationchange = null;
      AUDIO.onseeked = null;
      AUDIO.onerror = null;
      AUDIO.removeAttribute("src");
      AUDIO.load();
      globalThis.URL.revokeObjectURL(URL);
      resolve(duration !== null && Number.isFinite(duration) && duration > 0 ? duration : null);
    };
    const TIMEOUT = setTimeout(() => finish(null), METADATA_TIMEOUT_MS);
    AUDIO.onloadedmetadata = () => {
      // MediaRecorder WebM files can omit duration metadata. Seeking to the end
      // lets the browser determine their length without playing the recording.
      if (AUDIO.duration === Infinity) AUDIO.currentTime = Number.MAX_SAFE_INTEGER;
      else finish(AUDIO.duration);
    };
    AUDIO.ondurationchange = () => {
      if (Number.isFinite(AUDIO.duration) && AUDIO.duration > 0) finish(AUDIO.duration);
    };
    AUDIO.onseeked = () => finish(Number.isFinite(AUDIO.duration) ? AUDIO.duration : AUDIO.currentTime);
    AUDIO.onerror = () => finish(null);
    AUDIO.src = URL;
  });
}
