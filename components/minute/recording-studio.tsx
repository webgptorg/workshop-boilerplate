"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { audioKey, saveAudio } from "@/lib/minute/storage";
import { clockTime, draftNotes, uid } from "@/lib/minute/utils";
import type { ActionItem, Call } from "@/lib/minute/types";
import { useMinute } from "./provider";
import { Icon } from "./icon";

type Segment = {
  id: string;
  name: string;
  duration: number;
  blob: Blob;
  url: string;
};
type SpeechResult = { isFinal: boolean; 0: { transcript: string } };
type SpeechService = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult:
    | ((event: {
        resultIndex: number;
        results: { length: number; [index: number]: SpeechResult };
      }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type SpeechConstructor = new () => SpeechService;
type SpeechWindow = Window & {
  SpeechRecognition?: SpeechConstructor;
  webkitSpeechRecognition?: SpeechConstructor;
};
const allowedExtensions = /\.(mp3|mp4|m4a|mpeg|mpg|wav|webm)$/i;
function mediaDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const timer = setTimeout(() => {
      audio.removeAttribute("src");
      resolve(0);
    }, 5000);
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      clearTimeout(timer);
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      audio.removeAttribute("src");
      resolve(duration);
    };
    audio.onerror = () => {
      clearTimeout(timer);
      resolve(0);
    };
    audio.src = url;
  });
}
export function RecordingStudio() {
  const { workspace, user, t, language, updateWorkspace, notify } = useMinute();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [status, setStatus] = useState<
    "idle" | "requesting" | "recording" | "paused" | "stopping"
  >("idle");
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState("");
  const [draftActions, setDraftActions] = useState<string[]>([]);
  const [linkedActions, setLinkedActions] = useState<string[]>([]);
  const [transcribe, setTranscribe] = useState(false);
  const [callLanguage, setCallLanguage] = useState(
    language === "cs" ? "cs-CZ" : "en-US",
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("transcript");
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const speech = useRef<SpeechService | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startTime = useRef(0);
  const accumulated = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadButton = useRef<HTMLButtonElement>(null);
  const urls = useRef<string[]>([]);
  const mounted = useRef(true);
  const speechActive = useRef(false);
  useEffect(() => {
    mounted.current = true;
    const recordingUrls = urls.current;
    return () => {
      mounted.current = false;
      speechActive.current = false;
      speech.current?.abort();
      if (recorder.current && recorder.current.state !== "inactive")
        recorder.current.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
      recordingUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);
  useEffect(() => {
    if (status !== "recording") return;
    const timer = setInterval(
      () =>
        setElapsed(
          accumulated.current + (Date.now() - startTime.current) / 1000,
        ),
      200,
    );
    return () => clearInterval(timer);
  }, [status]);
  useEffect(() => {
    if (
      saved ||
      (!segments.length && !transcript && !notes && status === "idle")
    )
      return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [segments.length, transcript, notes, status, saved]);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "upload")
      uploadButton.current?.focus();
  }, []);
  function startSpeech() {
    if (!transcribe) return;
    const browser = window as SpeechWindow;
    const Recognition =
      browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!Recognition) {
      notify(
        t(
          "Live transcription is unavailable in this browser. You can add a transcript below.",
          "Živý přepis není v tomto prohlížeči dostupný. Vložte přepis níže.",
        ),
      );
      return;
    }
    const recognition = new Recognition();
    recognition.lang = callLanguage;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal)
          setTranscript(
            (previous) =>
              `${previous}${previous ? "\n" : ""}${result[0].transcript}`,
          );
      }
    };
    recognition.onerror = (event) => {
      if (event.error !== "aborted") {
        speechActive.current = false;
        notify(
          t(
            "Live transcription stopped. Audio recording is still available.",
            "Živý přepis se zastavil. Zvuk se dál nahrává.",
          ),
        );
      }
    };
    recognition.onend = () => {
      if (speechActive.current && mounted.current) {
        try {
          recognition.start();
        } catch {
          speechActive.current = false;
        }
      }
    };
    speech.current = recognition;
    speechActive.current = true;
    try {
      recognition.start();
    } catch {
      speechActive.current = false;
      notify(
        t(
          "Could not start live transcription.",
          "Živý přepis se nepodařilo spustit.",
        ),
      );
    }
  }
  async function start() {
    setError("");
    setStatus("requesting");
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)
        throw new Error(
          t(
            "Microphone recording needs a supported browser and a secure connection. You can upload a file instead.",
            "Nahrávání vyžaduje podporovaný prohlížeč a zabezpečené připojení. Můžete nahrát soubor.",
          ),
        );
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = media;
      const mime = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find(
        (type) => MediaRecorder.isTypeSupported(type),
      );
      const rec = new MediaRecorder(
        media,
        mime ? { mimeType: mime } : undefined,
      );
      recorder.current = rec;
      chunks.current = [];
      accumulated.current = 0;
      setElapsed(0);
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data);
      };
      rec.onstop = () => {
        media.getTracks().forEach((track) => track.stop());
        speechActive.current = false;
        speech.current?.stop();
        if (!mounted.current) return;
        const blob = new Blob(chunks.current, {
          type: rec.mimeType || "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        urls.current.push(url);
        if (blob.size)
          setSegments((previous) => [
            ...previous,
            {
              id: uid(),
              name: `${t("Microphone recording", "Nahrávka mikrofonu")} ${previous.length + 1}`,
              duration: accumulated.current,
              blob,
              url,
            },
          ]);
        setStatus("idle");
        setElapsed(0);
      };
      rec.onerror = () => {
        setError(
          t(
            "Recording was interrupted. Try again.",
            "Nahrávání bylo přerušeno. Zkuste to znovu.",
          ),
        );
        media.getTracks().forEach((track) => track.stop());
        setStatus("idle");
      };
      rec.start(1000);
      startTime.current = Date.now();
      setStatus("recording");
      startSpeech();
    } catch (e) {
      stream.current?.getTracks().forEach((track) => track.stop());
      setError(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? t(
              "Microphone access was denied. Allow it in your browser settings or upload a file.",
              "Přístup k mikrofonu byl zamítnut. Povolte ho v prohlížeči nebo nahrajte soubor.",
            )
          : e instanceof Error
            ? e.message
            : "Could not access the microphone.",
      );
      setStatus("idle");
    }
  }
  function pause() {
    if (recorder.current?.state !== "recording") return;
    accumulated.current += (Date.now() - startTime.current) / 1000;
    setElapsed(accumulated.current);
    recorder.current.pause();
    speechActive.current = false;
    speech.current?.stop();
    setStatus("paused");
  }
  function resume() {
    if (recorder.current?.state !== "paused") return;
    recorder.current.resume();
    startTime.current = Date.now();
    setStatus("recording");
    startSpeech();
  }
  function stop() {
    if (!recorder.current || recorder.current.state === "inactive") return;
    if (status === "recording")
      accumulated.current += (Date.now() - startTime.current) / 1000;
    setStatus("stopping");
    recorder.current.stop();
  }
  async function upload(files: FileList | File[]) {
    setError("");
    setImporting(true);
    try {
      for (const file of Array.from(files)) {
        if (!allowedExtensions.test(file.name)) {
          notify(
            `${file.name}: ${t("unsupported file type", "nepodporovaný typ souboru")}`,
          );
          continue;
        }
        if (file.size > 200 * 1024 * 1024) {
          notify(
            t(
              "Files must be smaller than 200 MB.",
              "Soubory musí být menší než 200 MB.",
            ),
          );
          continue;
        }
        const url = URL.createObjectURL(file);
        urls.current.push(url);
        const duration = await mediaDuration(url);
        if (mounted.current)
          setSegments((previous) => [
            ...previous,
            { id: uid(), name: file.name, blob: file, duration, url },
          ]);
      }
    } finally {
      if (mounted.current) setImporting(false);
    }
  }
  function generate() {
    if (!transcript.trim()) {
      setActiveTab("transcript");
      setError(
        t(
          "Add a transcript first. Uploaded audio is not automatically transcribed in this local demo.",
          "Nejprve vložte přepis. Nahrané audio se v tomto místním demu automaticky nepřepisuje.",
        ),
      );
      return;
    }
    const result = draftNotes(
      transcript,
      callLanguage.startsWith("cs") ? "cs" : "en",
    );
    setNotes(result.notes);
    setDraftActions(result.actions);
    setActiveTab("notes");
    setError("");
    notify(
      t(
        "Draft ready. Review the notes and action items before saving.",
        "Návrh je připraven. Před uložením zkontrolujte poznámky a úkoly.",
      ),
    );
  }
  async function save() {
    if (
      !workspace ||
      !user ||
      !title.trim() ||
      (!segments.length && !transcript.trim() && !notes.trim())
    )
      return;
    setBusy(true);
    setError("");
    try {
      for (const segment of segments)
        await saveAudio(
          audioKey(user.id, workspace.id, segment.id),
          segment.blob,
        );
      const id = uid();
      const date = new Date().toISOString();
      const call: Call = {
        id,
        title: title.trim(),
        summary: transcript
          ? draftNotes(transcript, language).summary.slice(0, 210)
          : notes.replace(/[#\n]/g, " ").trim().slice(0, 210) ||
            t(
              "A recorded conversation, ready for your notes.",
              "Nahraný rozhovor připravený na poznámky.",
            ),
        notes,
        transcript,
        date,
        duration: segments.reduce((sum, s) => sum + s.duration, 0),
        recordings: segments.map((s) => ({
          id: s.id,
          name: s.name,
          duration: s.duration,
          type: s.blob.type,
        })),
        category: "Meeting",
        starred: false,
        participants: [user.name.split(" ")[0]],
        language: callLanguage,
      };
      const actions: ActionItem[] = draftActions
        .filter((a) => a.trim())
        .map((title) => ({
          id: uid(),
          title: title.trim(),
          description: "",
          completed: false,
          callIds: [id],
          relatedIds: [],
          assignee: "",
          dueDate: "",
          comments: [],
          history: [{ text: "Created from call transcript", date }],
        }));
      updateWorkspace((w) => ({
        ...w,
        calls: [call, ...w.calls],
        actions: [
          ...w.actions.map((a) =>
            linkedActions.includes(a.id)
              ? {
                  ...a,
                  callIds: [...new Set([...a.callIds, id])],
                  history: [
                    ...a.history,
                    { text: `Linked to ${call.title}`, date },
                  ],
                }
              : a,
          ),
          ...actions,
        ],
      }));
      setSaved(true);
      notify(
        t(
          "Call saved. A good idea, kept.",
          "Hovor uložen. Dobrý nápad zůstává.",
        ),
      );
      router.push(`/${workspace.id}/calls/${id}`);
    } catch {
      setError(
        t(
          "Could not save the recording. Browser storage may be full. Your recordings are still here; download them before leaving.",
          "Nahrávku se nepodařilo uložit. Úložiště může být plné. Než odejdete, stáhněte si nahrávky.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  if (!workspace) return null;
  const active = status !== "idle";
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {t("RECORDING STUDIO", "NAHRÁVACÍ STUDIO")}
          </span>
          <h1>{t("A little space to listen.", "Prostor pro naslouchání.")}</h1>
        </div>
        <span className="local-only-label">
          <Icon name="lock" size={14} />
          {t("Saved in this browser", "Uloženo v tomto prohlížeči")}
        </span>
      </div>
      <div className="studio-layout">
        <div className="studio-primary">
          <input
            className="call-title-input"
            aria-label={t("Call title", "Název hovoru")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t(
              "Give this conversation a name…",
              "Pojmenujte tento rozhovor…",
            )}
          />
          <Card
            className={`recorder-card ${status === "recording" ? "is-recording" : ""}`}
          >
            <div className="recorder-status">
              <span
                className={`status-dot ${status === "recording" ? "live-dot" : ""}`}
              />
              {status === "recording"
                ? t("RECORDING", "NAHRÁVÁNÍ")
                : status === "paused"
                  ? t("PAUSED", "POZASTAVENO")
                  : status === "requesting"
                    ? t("WAITING FOR MICROPHONE", "ČEKÁNÍ NA MIKROFON")
                    : status === "stopping"
                      ? t("SAVING CLIP", "UKLÁDÁNÍ NAHRÁVKY")
                      : t("READY WHEN YOU ARE", "PŘIPRAVENO")}
            </div>
            <div className="recorder-timer">{clockTime(elapsed)}</div>
            <div
              className={`studio-wave ${status === "recording" ? "wave-active" : ""}`}
            >
              {Array.from({ length: 49 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    height:
                      status === "recording" || status === "paused"
                        ? Math.round(10 + Math.abs(Math.sin(i * 2.3)) * 45)
                        : Math.round(4 + Math.abs(Math.sin(i * 0.75)) * 10),
                    animationDelay: `${i * -0.13}s`,
                  }}
                />
              ))}
            </div>
            <div className="recorder-controls">
              {status === "idle" ? (
                <Button onClick={start}>
                  <Icon name="mic" size={19} />
                  {segments.length
                    ? t("Record another part", "Nahrát další část")
                    : t("Start recording", "Začít nahrávat")}
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={status === "paused" ? resume : pause}
                    disabled={status === "requesting" || status === "stopping"}
                  >
                    <Icon
                      name={status === "paused" ? "play" : "pause"}
                      size={17}
                    />
                    {status === "paused"
                      ? t("Resume", "Pokračovat")
                      : t("Pause", "Pozastavit")}
                  </Button>
                  <Button
                    onClick={stop}
                    disabled={status === "requesting" || status === "stopping"}
                  >
                    <Icon name="stop" size={17} />
                    {t("Finish this part", "Dokončit tuto část")}
                  </Button>
                </>
              )}
            </div>
            <div className="recorder-options">
              <label>
                <input
                  type="checkbox"
                  checked={transcribe}
                  disabled={active}
                  onChange={(e) => setTranscribe(e.target.checked)}
                />
                {t(
                  "Live transcript (browser service)",
                  "Živý přepis (služba prohlížeče)",
                )}
              </label>
              <select
                aria-label="Transcription language"
                value={callLanguage}
                onChange={(e) => setCallLanguage(e.target.value)}
                disabled={active}
              >
                <option value="en-US">English</option>
                <option value="cs-CZ">Čeština</option>
                <option value="de-DE">Deutsch</option>
                <option value="fr-FR">Français</option>
                <option value="es-ES">Español</option>
                <option value="it-IT">Italiano</option>
                <option value="pt-BR">Português</option>
                <option value="ja-JP">日本語</option>
                <option value="zh-CN">中文</option>
                <option value="auto">
                  {t("Other / manual transcript", "Jiný / ruční přepis")}
                </option>
              </select>
            </div>
            {transcribe && (
              <p className="transcription-notice">
                {t(
                  "When supported, your browser’s speech service processes microphone audio. Availability and language support vary.",
                  "Pokud je dostupná, řečová služba prohlížeče zpracovává zvuk mikrofonu. Podpora jazyků se liší.",
                )}
              </p>
            )}
          </Card>
          <div
            className={`upload-zone ${dragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void upload(e.dataTransfer.files);
            }}
          >
            <span className="upload-icon">
              <Icon name="upload" size={23} />
            </span>
            <button
              ref={uploadButton}
              className="text-button"
              onClick={() => fileInput.current?.click()}
              disabled={importing}
            >
              {importing
                ? t("Adding your files…", "Přidávání souborů…")
                : t(
                    "Choose files or drop them here",
                    "Vyberte nebo přetáhněte soubory",
                  )}
            </button>
            <span className="small muted">
              MP3, MP4, M4A, MPEG, WAV, WebM · 200 MB max
            </span>
            <input
              ref={fileInput}
              type="file"
              accept=".mp3,.mp4,.m4a,.mpeg,.mpg,.wav,.webm"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files) void upload(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
          {segments.length > 0 && (
            <section className="recording-segments">
              <div className="section-heading">
                <h2>
                  {t("Parts of this call", "Části tohoto hovoru")}
                  <span className="count-badge">{segments.length}</span>
                </h2>
              </div>
              {segments.map((segment, i) => (
                <Card className="recording-segment" key={segment.id}>
                  <div className="segment-top">
                    <span className="segment-number">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <strong>{segment.name}</strong>
                    <span>{clockTime(segment.duration)}</span>
                    <a
                      className="icon-button"
                      href={segment.url}
                      download={
                        segment.name.includes(".")
                          ? segment.name
                          : `${segment.name}.${segment.blob.type.includes("mp4") ? "m4a" : "webm"}`
                      }
                      aria-label="Download recording"
                    >
                      <Icon name="download" size={16} />
                    </a>
                    <button
                      className="icon-button"
                      aria-label={`Remove ${segment.name}`}
                      onClick={() => {
                        setSegments((previous) =>
                          previous.filter((s) => s.id !== segment.id),
                        );
                        URL.revokeObjectURL(segment.url);
                      }}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                  <audio controls src={segment.url} preload="metadata" />
                </Card>
              ))}
            </section>
          )}
          <Card className="transcript-card">
            <div className="detail-tabs">
              <button
                className={activeTab === "transcript" ? "active" : ""}
                onClick={() => setActiveTab("transcript")}
              >
                <Icon name="file" size={16} />
                {t("Transcript", "Přepis")}
              </button>
              <button
                className={activeTab === "notes" ? "active" : ""}
                onClick={() => setActiveTab("notes")}
              >
                <Icon name="sparkles" size={16} />
                {t("Notes", "Poznámky")}
              </button>
              <Button variant="secondary" onClick={generate} disabled={active}>
                <Icon name="sparkles" size={15} />
                {t("Generate draft", "Vygenerovat návrh")}
              </Button>
            </div>
            <textarea
              aria-label={
                activeTab === "transcript" ? "Call transcript" : "Call notes"
              }
              rows={9}
              value={activeTab === "transcript" ? transcript : notes}
              onChange={(e) =>
                activeTab === "transcript"
                  ? setTranscript(e.target.value)
                  : setNotes(e.target.value)
              }
              placeholder={
                activeTab === "transcript"
                  ? t(
                      "Your live transcript appears here. You can also paste or write a transcript in any language…",
                      "Tady se objeví živý přepis. Můžete také vložit přepis v libovolném jazyce…",
                    )
                  : t(
                      "Write your notes, or generate a draft from the transcript…",
                      "Napište poznámky nebo vygenerujte návrh z přepisu…",
                    )
              }
            />
            <div className="transcript-footnote">
              <Icon name="help" size={13} />
              {t(
                "Local, rule-based drafts. Review before saving. Uploaded files need a transcript.",
                "Místní návrhy podle pravidel. Před uložením je zkontrolujte. Soubory vyžadují přepis.",
              )}
            </div>
          </Card>
        </div>
        <aside className="studio-aside">
          <Card className="studio-summary">
            <span className="call-type-icon category-meeting">
              <Icon name="file" size={21} />
            </span>
            <h2>{t("This conversation", "Tento rozhovor")}</h2>
            <div className="summary-line">
              <span>{t("Recordings", "Nahrávky")}</span>
              <strong>{segments.length}</strong>
            </div>
            <div className="summary-line">
              <span>{t("Total duration", "Celková délka")}</span>
              <strong>
                {clockTime(segments.reduce((s, r) => s + r.duration, 0))}
              </strong>
            </div>
            <div className="summary-line">
              <span>{t("Action items", "Úkoly")}</span>
              <strong>{draftActions.length + linkedActions.length}</strong>
            </div>
            <Button
              disabled={
                busy ||
                active ||
                importing ||
                !title.trim() ||
                (!segments.length && !transcript.trim() && !notes.trim())
              }
              onClick={save}
            >
              <Icon name="check" size={17} />
              {busy
                ? t("Saving…", "Ukládání…")
                : t("Save call", "Uložit hovor")}
            </Button>
            {!title.trim() && (
              <span className="small muted save-hint">
                {t(
                  "Add a name to save your call.",
                  "Pro uložení pojmenujte hovor.",
                )}
              </span>
            )}
          </Card>
          <Card className="studio-actions">
            <div className="section-heading">
              <h2>{t("Next steps", "Další kroky")}</h2>
              <button
                className="icon-button"
                aria-label="Add action item"
                onClick={() => setDraftActions((previous) => [...previous, ""])}
              >
                <Icon name="plus" size={18} />
              </button>
            </div>
            {draftActions.length ? (
              draftActions.map((action, index) => (
                <div className="draft-action" key={index}>
                  <Icon name="check" size={16} />
                  <input
                    value={action}
                    onChange={(e) =>
                      setDraftActions((previous) =>
                        previous.map((a, i) =>
                          i === index ? e.target.value : a,
                        ),
                      )
                    }
                    placeholder={t("A next step…", "Další krok…")}
                  />
                  <button
                    className="icon-button"
                    aria-label="Remove action item"
                    onClick={() =>
                      setDraftActions((previous) =>
                        previous.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              ))
            ) : (
              <span className="small muted">
                {t(
                  "Add a task or generate one from your transcript.",
                  "Přidejte úkol nebo jej vygenerujte z přepisu.",
                )}
              </span>
            )}
          </Card>
          <Card className="existing-actions">
            <h2>
              {t(
                "Pick up where you left off",
                "Navažte tam, kde jste skončili",
              )}
            </h2>
            <div className="existing-action-list">
              {workspace.actions
                .filter((a) => !a.completed)
                .map((a) => (
                  <label key={a.id}>
                    <input
                      className="task-checkbox"
                      type="checkbox"
                      checked={linkedActions.includes(a.id)}
                      onChange={(e) =>
                        setLinkedActions(
                          e.target.checked
                            ? [...linkedActions, a.id]
                            : linkedActions.filter((id) => id !== a.id),
                        )
                      }
                    />
                    <span>{a.title}</span>
                  </label>
                ))}
            </div>
          </Card>
        </aside>
      </div>
      {error && (
        <div className="studio-error" role="alert">
          <Icon name="help" size={20} />
          {error}
          <button
            className="icon-button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
          >
            <Icon name="close" size={17} />
          </button>
        </div>
      )}
    </>
  );
}
