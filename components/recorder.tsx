"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { Modal } from "@/components/modal";
import { formatDuration, isMeetingNotes, type Meeting } from "@/lib/meetings";

type RecorderStatus =
  "idle" | "requesting" | "recording" | "paused" | "ready" | "processing";
type Mode = "record" | "upload" | "transcript";

export function Recorder({
  initialMode,
  onClose,
  onCreated,
}: {
  initialMode: Mode;
  onClose: () => void;
  onCreated: (meeting: Meeting, audio?: Blob) => Promise<void>;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const alive = useRef(true);
  const secondsRef = useRef(0);
  const busy = status === "processing" || status === "requesting";
  const active = status === "recording" || status === "paused";

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (recorder.current && recorder.current.state !== "inactive")
        recorder.current.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (status !== "recording") return;
    const timer = window.setInterval(() => {
      secondsRef.current += 1;
      setSeconds(secondsRef.current);
      if (secondsRef.current >= 3600) recorder.current?.stop();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (!active && !file && !busy) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [active, file, busy]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    queueMicrotask(() => setAudioUrl(url));
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function close() {
    if (busy) return;
    if (
      (active || file || transcript.trim()) &&
      !window.confirm("Discard this unsaved meeting?")
    )
      return;
    onClose();
  }

  async function start() {
    setError("");
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setError(
        "Microphone recording needs a supported browser on HTTPS or localhost. You can still upload audio or paste a transcript.",
      );
      return;
    }
    setStatus("requesting");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      if (!alive.current) {
        mediaStream.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = mediaStream;
      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/mp4",
        "audio/webm",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      const mediaRecorder = new MediaRecorder(mediaStream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: 64_000,
      });
      recorder.current = mediaRecorder;
      const chunks: Blob[] = [];
      let size = 0;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size) {
          chunks.push(event.data);
          size += event.data.size;
        }
        if (size > 23 * 1024 * 1024 && mediaRecorder.state !== "inactive")
          mediaRecorder.stop();
      };
      mediaRecorder.onerror = () => {
        setError(
          "The microphone was interrupted. You can process the captured audio or try recording again.",
        );
        if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
        mediaStream.getTracks().forEach((track) => track.stop());
        setStatus("ready");
      };
      mediaRecorder.onstop = () => {
        mediaStream.getTracks().forEach((track) => track.stop());
        if (!alive.current) return;
        const type = mediaRecorder.mimeType || "audio/webm";
        const audioFile = new File(
          chunks,
          `meeting.${type.includes("mp4") ? "m4a" : "webm"}`,
          { type },
        );
        setFile(audioFile);
        setStatus("ready");
      };
      secondsRef.current = 0;
      setSeconds(0);
      setFile(null);
      mediaRecorder.start(1000);
      setStatus("recording");
    } catch (failure) {
      stream.current?.getTracks().forEach((track) => track.stop());
      setStatus("idle");
      setError(
        failure instanceof DOMException && failure.name === "NotAllowedError"
          ? "Microphone access was denied. Allow the microphone in your browser’s site settings, or upload a recording."
          : "We couldn’t access your microphone. Check that it’s connected and try again.",
      );
    }
  }

  function togglePause() {
    if (recorder.current?.state === "recording") {
      recorder.current.pause();
      setStatus("paused");
    } else if (recorder.current?.state === "paused") {
      recorder.current.resume();
      setStatus("recording");
    }
  }

  function selectFile(nextFile?: File) {
    if (!nextFile) return;
    if (!/\.(mp3|mp4|mpeg|mpga|m4a|wav|webm)$/i.test(nextFile.name)) {
      setError("Choose an MP3, MP4, M4A, WAV, or WebM recording.");
      return;
    }
    if (!nextFile.size || nextFile.size > 24 * 1024 * 1024) {
      setError("Choose a non-empty recording smaller than 24 MB.");
      return;
    }
    setError("");
    setFile(nextFile);
    setStatus("ready");
    setSeconds(0);
    if (!title)
      setTitle(nextFile.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "));
  }

  async function generate() {
    setError("");
    setStatus("processing");
    try {
      const form = new FormData();
      form.append("title", title);
      if (mode === "transcript") form.append("transcript", transcript);
      else if (file) form.append("audio", file);
      const response = await fetch("/api/meetings", {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(180_000),
      });
      const data: unknown = await response.json();
      if (!response.ok)
        throw new Error(
          data &&
            typeof data === "object" &&
            "error" in data &&
            typeof data.error === "string"
            ? data.error
            : "We couldn’t process this meeting. Please try again.",
        );
      if (
        !isMeetingNotes(data) ||
        !("transcript" in data) ||
        typeof data.transcript !== "string"
      )
        throw new Error(
          "The notes weren’t returned correctly. Please try again.",
        );
      const id = crypto.randomUUID();
      await onCreated(
        {
          ...data,
          id,
          title: title.trim() || data.title,
          transcript: data.transcript,
          date: new Date().toISOString(),
          duration: mode === "transcript" ? 0 : seconds,
          starred: false,
          tasks: data.tasks.map((task) => ({
            ...task,
            id: crypto.randomUUID(),
            completed: false,
          })),
        },
        mode !== "transcript" ? (file ?? undefined) : undefined,
      );
    } catch (failure) {
      setStatus(file ? "ready" : "idle");
      setError(
        failure instanceof Error
          ? failure.name === "TimeoutError"
            ? "This is taking a little longer. Your recording is still here; please try again."
            : failure.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <Modal
      title="New meeting"
      onClose={close}
      locked={busy}
      className="recorder-modal"
    >
      <div className="dialog-eyebrow">
        <Icon name="sparkles" size={15} /> A LITTLE LESS NOTE-TAKING
      </div>
      <h2>Make every word count.</h2>
      <p className="dialog-description">
        Bring the conversation. We’ll find the takeaways.
      </p>
      <div className="segmented-control recorder-tabs">
        {(
          [
            ["record", "mic", "Record"],
            ["upload", "upload", "Upload audio"],
            ["transcript", "file", "Paste transcript"],
          ] as const
        ).map(([value, icon, label]) => (
          <button
            key={value}
            className={mode === value ? "selected" : ""}
            disabled={active || busy}
            onClick={() => {
              setMode(value);
              setError("");
            }}
          >
            <Icon name={icon} size={16} />
            {label}
          </button>
        ))}
      </div>
      <label className="field-label" htmlFor="meeting-title">
        Meeting name <span>(optional)</span>
      </label>
      <input
        id="meeting-title"
        className="input"
        placeholder="e.g. Monday team catch-up"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={160}
        disabled={busy}
      />

      {status === "processing" ? (
        <div className="processing-state">
          <div className="processing-orb">
            <Icon name="sparkles" size={35} />
          </div>
          <h3>Turning words into clarity.</h3>
          <p>
            Transcribing your conversation and gathering
            <br />
            the notes, decisions, and next steps.
          </p>
          <div className="processing-track">
            <span />
          </div>
          <span className="small-muted">
            Keep this window open. This may take a minute or two.
          </span>
        </div>
      ) : (
        <>
          {mode === "record" && (
            <div className={`recording-studio ${active ? "is-active" : ""}`}>
              <div
                className={`recording-mic ${status === "recording" ? "is-recording" : ""}`}
              >
                <Icon name="mic" size={28} />
              </div>
              <div className="recording-timer">{formatDuration(seconds)}</div>
              <div className="recording-caption">
                {status === "recording"
                  ? "Recording your microphone"
                  : status === "paused"
                    ? "Take your time. Recording is paused."
                    : file
                      ? "All captured. Ready for your notes?"
                      : "A little presence goes a long way."}
              </div>
              <div
                className={`sound-wave ${status === "recording" ? "animated" : ""}`}
                aria-hidden="true"
              >
                {Array.from({ length: 35 }, (_, index) => (
                  <span
                    key={index}
                    style={{
                      height: `${10 + ((index * 17 + 13) % 34)}px`,
                      animationDelay: `${index * 0.065}s`,
                    }}
                  />
                ))}
              </div>
              {active ? (
                <div className="button-row">
                  <Button variant="secondary" onClick={togglePause}>
                    <Icon
                      name={status === "paused" ? "play" : "pause"}
                      size={16}
                    />
                    {status === "paused" ? "Resume" : "Pause"}
                  </Button>
                  <Button onClick={() => recorder.current?.stop()}>
                    <Icon name="stop" size={16} />
                    Finish recording
                  </Button>
                </div>
              ) : !file ? (
                <Button onClick={start} disabled={busy}>
                  <Icon name="mic" size={17} />
                  {status === "requesting"
                    ? "Connecting microphone…"
                    : "Start recording"}
                </Button>
              ) : (
                <button className="text-button" onClick={start}>
                  Record again
                </button>
              )}
            </div>
          )}
          {mode === "upload" && (
            <button
              className={`upload-zone ${dragging ? "dragging" : ""}`}
              onClick={() => fileInput.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                selectFile(event.dataTransfer.files[0]);
              }}
            >
              <span className="upload-icon">
                <Icon name={file ? "checkCircle" : "upload"} size={27} />
              </span>
              <strong>{file ? file.name : "Drop your recording here"}</strong>
              <span>
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(1)} MB · Click to choose another file`
                  : "or click to browse your files"}
              </span>
              <small>MP3, M4A, WAV, MP4, or WebM · Up to 24 MB</small>
            </button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept=".mp3,.mp4,.mpeg,.mpga,.m4a,.wav,.webm"
            hidden
            onChange={(event) => selectFile(event.target.files?.[0])}
          />
          {mode === "transcript" && (
            <textarea
              className="input transcript-input"
              aria-label="Meeting transcript"
              placeholder="Paste your meeting transcript here. Include names and deadlines to make your action items more useful…"
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              maxLength={150_000}
            />
          )}
          {file && audioUrl && mode !== "transcript" && (
            <div className="recording-preview">
              <audio
                className="audio-player"
                controls
                src={audioUrl}
                onLoadedMetadata={(event) => {
                  if (
                    mode === "upload" &&
                    Number.isFinite(event.currentTarget.duration)
                  )
                    setSeconds(Math.round(event.currentTarget.duration));
                }}
              />
              <a className="text-button" href={audioUrl} download={file.name}>
                <Icon name="download" size={14} />
                Save a copy of the recording
              </a>
            </div>
          )}
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
          {((file && !active) || mode === "transcript") && (
            <Button
              className="generate-button"
              onClick={generate}
              disabled={
                mode === "transcript" ? transcript.trim().length < 15 : !file
              }
            >
              <Icon name="sparkles" size={18} />
              Create notes & action items
              <Icon name="arrow" size={17} />
            </Button>
          )}
          <p className="recorder-footnote">
            <Icon name="headphones" size={14} />
            {mode === "record"
              ? "Records your microphone for up to 60 minutes. Let everyone know you’re recording."
              : "Audio and transcripts are sent to OpenAI to create your notes."}
          </p>
          {mode === "record" && (
            <p className="processing-disclosure">
              Audio is sent to OpenAI when you create notes. Recordings are
              saved in this browser.
            </p>
          )}
        </>
      )}
    </Modal>
  );
}
