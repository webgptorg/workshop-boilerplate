"use client";

import { useEffect, useRef, useState } from "react";

type RecorderStatus = "idle" | "requesting" | "recording" | "paused" | "saving";

interface SpeechResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechEvent {
  resultIndex: number;
  results: ArrayLike<SpeechResult>;
}
interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechConstructor = new () => BrowserSpeechRecognition;

function speechConstructor(): SpeechConstructor | undefined {
  const browser = window as Window & {
    SpeechRecognition?: SpeechConstructor;
    webkitSpeechRecognition?: SpeechConstructor;
  };
  return browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
}

export function useMeetingRecorder(
  onComplete: (audio: Blob, duration: number, transcript: string) => void,
  onTranscript: (text: string) => void,
) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [seconds, setSeconds] = useState(0);
  const [interim, setInterim] = useState("");
  const [message, setMessage] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const speech = useRef<BrowserSpeechRecognition | null>(null);
  const chunks = useRef<Blob[]>([]);
  const statusRef = useRef<RecorderStatus>("idle");
  const elapsedMs = useRef(0);
  const resumedAt = useRef(0);
  const transcriptRef = useRef("");
  const onCompleteRef = useRef(onComplete);
  const onTranscriptRef = useRef(onTranscript);
  onCompleteRef.current = onComplete;
  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    if (status !== "recording") return;
    const timer = window.setInterval(
      () =>
        setSeconds(
          Math.floor(
            (elapsedMs.current + Date.now() - resumedAt.current) / 1000,
          ),
        ),
      250,
    );
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(
    () => () => {
      speech.current?.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  function setTranscript(value: string) {
    transcriptRef.current = value;
  }

  function beginSpeech() {
    const Recognition = speechConstructor();
    if (!Recognition) {
      setMessage(
        "Live transcription is unavailable in this browser. Type or paste a transcript below.",
      );
      return;
    }
    const recognition = new Recognition();
    let processed = 0;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";
    recognition.onresult = (event) => {
      let pending = "";
      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];
        if (result.isFinal && index >= processed) {
          const words = result[0].transcript.trim();
          if (words) {
            transcriptRef.current = `${transcriptRef.current}${transcriptRef.current ? " " : ""}${words}`;
            onTranscriptRef.current(transcriptRef.current);
          }
          processed = index + 1;
        } else if (!result.isFinal) {
          pending += result[0].transcript;
        }
      }
      setInterim(pending);
    };
    recognition.onerror = (event) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        setMessage(
          event.error === "not-allowed" || event.error === "service-not-allowed"
            ? "Transcription was blocked. Recording continues; you can add a transcript manually."
            : "Live transcription stopped. Recording continues; you can add a transcript manually.",
        );
        speech.current = null;
      }
    };
    recognition.onend = () => {
      setInterim("");
      if (speech.current === recognition && statusRef.current === "recording") {
        window.setTimeout(() => {
          if (
            speech.current === recognition &&
            statusRef.current === "recording"
          )
            beginSpeech();
        }, 350);
      }
    };
    speech.current = recognition;
    try {
      recognition.start();
      setMessage("");
    } catch {
      speech.current = null;
      setMessage(
        "Live transcription could not start. Type or paste a transcript below.",
      );
    }
  }

  function endSpeech() {
    const recognition = speech.current;
    speech.current = null;
    recognition?.stop();
    setInterim("");
  }

  async function start() {
    setMessage("");
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setMessage(
        "Microphone recording is unavailable here. You can still create notes from a transcript.",
      );
      return;
    }
    statusRef.current = "requesting";
    setStatus("requesting");
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = media;
      const instance = new MediaRecorder(media);
      recorder.current = instance;
      chunks.current = [];
      instance.ondataavailable = (event) => {
        if (event.data.size) chunks.current.push(event.data);
      };
      instance.onstop = () => {
        media.getTracks().forEach((track) => track.stop());
        stream.current = null;
        const audio = new Blob(chunks.current, {
          type: instance.mimeType || "audio/webm",
        });
        onCompleteRef.current(
          audio,
          Math.floor(elapsedMs.current / 1000),
          transcriptRef.current,
        );
        statusRef.current = "idle";
        setStatus("idle");
      };
      elapsedMs.current = 0;
      resumedAt.current = Date.now();
      setSeconds(0);
      instance.start(1000);
      statusRef.current = "recording";
      setStatus("recording");
      beginSpeech();
    } catch {
      stream.current?.getTracks().forEach((track) => track.stop());
      statusRef.current = "idle";
      setStatus("idle");
      setMessage(
        "Microphone access was not granted. You can still create notes from a transcript.",
      );
    }
  }

  function pause() {
    if (recorder.current?.state !== "recording") return;
    recorder.current.pause();
    elapsedMs.current += Date.now() - resumedAt.current;
    setSeconds(Math.floor(elapsedMs.current / 1000));
    statusRef.current = "paused";
    setStatus("paused");
    endSpeech();
  }

  function resume() {
    if (recorder.current?.state !== "paused") return;
    recorder.current.resume();
    resumedAt.current = Date.now();
    statusRef.current = "recording";
    setStatus("recording");
    beginSpeech();
  }

  function stop() {
    if (!recorder.current || statusRef.current === "saving") return;
    if (statusRef.current === "recording")
      elapsedMs.current += Date.now() - resumedAt.current;
    setSeconds(Math.floor(elapsedMs.current / 1000));
    statusRef.current = "saving";
    setStatus("saving");
    endSpeech();
    recorder.current.stop();
  }

  function reset() {
    setSeconds(0);
    setInterim("");
    setMessage("");
    setTranscript("");
  }

  return {
    status,
    seconds,
    interim,
    message,
    setTranscript,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
