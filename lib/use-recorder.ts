"use client";

import { useEffect, useRef, useState } from "react";

interface SpeechResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechEvent {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechResult };
}
interface SpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type SpeechWindow = Window & { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition };

export function useRecorder(language: string, onSave: (blob: Blob, seconds: number, text: string) => Promise<void>) {
  const [status, setStatus] = useState<"idle" | "recording" | "paused" | "saving">("idle");
  const [seconds, setSeconds] = useState(0);
  const [liveText, setLiveText] = useState("");
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [recovery, setRecovery] = useState<{ blob: Blob; duration: number; text: string; url: string } | null>(null);
  const recoveryUrl = useRef("");
  const mounted = useRef(true);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const recognition = useRef<SpeechRecognition | null>(null);
  const text = useRef("");
  const elapsed = useRef(0);
  const startedAt = useRef(0);
  const callback = useRef(onSave);
  useEffect(() => {
    mounted.current = true;
    callback.current = onSave;
  }, [onSave]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (recorder.current?.state === "recording") setSeconds(elapsed.current + (Date.now() - startedAt.current) / 1000);
    }, 250);
    return () => {
      mounted.current = false;
      clearInterval(interval);
      if (recorder.current && recorder.current.state !== "inactive") recorder.current.stop();
      recognition.current?.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
      if (recoveryUrl.current) URL.revokeObjectURL(recoveryUrl.current);
    };
  }, []);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (status === "recording" || status === "paused" || status === "saving" || recovery) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status, recovery]);

  async function start() {
    if (recovery || requesting || recorder.current?.state === "recording") return;
    setError("");
    setRequesting(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error("unsupported");
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      if (!mounted.current) {
        stream.current.getTracks().forEach((track) => track.stop());
        return;
      }
      const mimeType = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((type) => MediaRecorder.isTypeSupported(type));
      const media = new MediaRecorder(stream.current, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 32000 });
      recorder.current = media;
      const chunks: Blob[] = [];
      let bytes = 0;
      text.current = "";
      elapsed.current = 0;
      startedAt.current = Date.now();
      setSeconds(0);
      setLiveText("");
      media.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
        bytes += event.data.size;
        if (bytes >= 24 * 1024 * 1024 && media.state !== "inactive") {
          setError("limit");
          media.stop();
        }
      };
      media.onstop = async () => {
        recognition.current?.stop();
        stream.current?.getTracks().forEach((track) => track.stop());
        const duration = elapsed.current + (startedAt.current ? (Date.now() - startedAt.current) / 1000 : 0);
        setStatus("saving");
        const blob = new Blob(chunks, { type: media.mimeType });
        try {
          if (blob.size) await callback.current(blob, duration, text.current.trim());
          setStatus("idle");
        } catch {
          recoveryUrl.current = URL.createObjectURL(blob);
          setRecovery({ blob, duration, text: text.current.trim(), url: recoveryUrl.current });
          setError("save");
          setStatus("idle");
        }
      };
      media.onerror = () => {
        setError("recording");
        if (media.state !== "inactive") media.stop();
      };
      media.start(1000);
      setStatus("recording");
      const Speech = (window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition;
      if (Speech) {
        const speech = new Speech();
        recognition.current = speech;
        speech.lang = language === "cs" ? "cs-CZ" : "en-US";
        speech.continuous = true;
        speech.interimResults = true;
        speech.onresult = (event) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) text.current += event.results[i][0].transcript + " ";
            else interim += event.results[i][0].transcript;
          }
          setLiveText(text.current + interim);
        };
        speech.onerror = () => {
          /* Audio remains available for server transcription. */
        };
        speech.onend = () => {
          if (media.state === "recording") {
            try {
              speech.start();
            } catch {
              /* Already active. */
            }
          }
        };
        try {
          speech.start();
        } catch {
          /* Live captions are optional. */
        }
      }
    } catch (reason) {
      stream.current?.getTracks().forEach((track) => track.stop());
      setError(
        reason instanceof DOMException && reason.name === "NotAllowedError"
          ? "permission"
          : reason instanceof Error && reason.message === "unsupported"
            ? "unsupported"
            : "microphone",
      );
    } finally {
      setRequesting(false);
    }
  }

  function pause() {
    const media = recorder.current;
    if (media?.state === "recording") {
      elapsed.current += (Date.now() - startedAt.current) / 1000;
      startedAt.current = 0;
      media.pause();
      recognition.current?.stop();
      setStatus("paused");
    } else if (media?.state === "paused") {
      startedAt.current = Date.now();
      media.resume();
      try {
        recognition.current?.start();
      } catch {
        /* Already active. */
      }
      setStatus("recording");
    }
  }
  function stop() {
    if (recorder.current && recorder.current.state !== "inactive") recorder.current.stop();
  }
  async function retrySave() {
    if (!recovery) return;
    setStatus("saving");
    try {
      await callback.current(recovery.blob, recovery.duration, recovery.text);
      URL.revokeObjectURL(recovery.url);
      recoveryUrl.current = "";
      setRecovery(null);
      setError("");
    } catch {
      setError("save");
    } finally {
      setStatus("idle");
    }
  }
  return { status, seconds, liveText, error, requesting, recovery, retrySave, start, pause, stop };
}
