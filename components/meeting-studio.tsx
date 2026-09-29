"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AudioLines, Check, LoaderCircle, Upload } from "lucide-react";
import { useMinute } from "./minute-provider";
import { useRecorder } from "@/lib/use-recorder";
import { useMeetingProcessing } from "@/lib/use-meeting-processing";
import { deleteRecordings, saveRecording } from "@/lib/media";
import { mutate } from "@/lib/store";
import { consumeRecordingStart } from "@/lib/recording-intent";
import { uid } from "@/lib/utils";
import type { Meeting, Recording } from "@/lib/types";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";
import { SectionHeading } from "./shared";
import { RecordingItem } from "./recording-item";
import { RecorderPanel } from "./recorder-panel";
import { StudioContext } from "./studio-context";

async function fileDuration(file: File): Promise<number> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve) => {
    const audio = new Audio();
    const finish = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const timeout = setTimeout(finish, 5000);
    audio.onloadedmetadata = finish;
    audio.onerror = finish;
    audio.src = url;
  });
}

export function MeetingStudio({ meeting }: { meeting: Meeting }) {
  const { state, t, notify } = useMinute();
  const mutateAccount = (updater: Parameters<typeof mutate>[0]) => mutate(updater, state.user.id);
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const processing = useMeetingProcessing(meeting);

  async function addRecording(blob: Blob, duration: number, transcript = "", name?: string) {
    const id = uid();
    await saveRecording(id, blob);
    const recording: Recording = {
      id,
      name: name ?? `${t("Recording", "Nahrávka")} ${meeting.recordings.length + 1}.${blob.type.includes("mp4") ? "m4a" : "webm"}`,
      mimeType: blob.type,
      size: blob.size,
      duration,
      createdAt: new Date().toISOString(),
      liveTranscript: transcript || undefined,
    };
    mutateAccount((current) => ({
      ...current,
      meetings: current.meetings.map((item) =>
        item.id === meeting.id ? { ...item, status: "in-progress", recordings: [...item.recordings, recording] } : item,
      ),
    }));
    notify(t("Recording saved", "Nahrávka uložena"));
  }
  const recorder = useRecorder(meeting.languages[0], addRecording);
  const START_RECORDING = recorder.start;
  useEffect(() => {
    if (!consumeRecordingStart(meeting.id)) return;
    void START_RECORDING();
  }, [meeting.id, START_RECORDING]);
  const recording = recorder.status === "recording" || recorder.status === "paused";
  const occupied = recording || recorder.status === "saving" || !!recorder.recovery || processing.busy || uploading || recorder.requesting;

  async function upload(files: FileList | File[]) {
    if (occupied) return;
    setUploading(true);
    setUploadError("");
    try {
      for (const file of Array.from(files)) {
        if (!/\.(mp3|mp4|mpeg|mpga|m4a|wav|webm|ogg|flac)$/i.test(file.name)) {
          setUploadError(
            t("Choose an MP3, MP4, M4A, WAV, WebM, OGG, or FLAC file.", "Vyberte soubor MP3, MP4, M4A, WAV, WebM, OGG nebo FLAC."),
          );
          continue;
        }
        if (!file.size || file.size > 25 * 1024 * 1024) {
          setUploadError(
            t(
              "Each file must be between 1 byte and 25 MB. Split larger recordings before uploading.",
              "Každý soubor musí mít 1 bajt až 25 MB. Větší nahrávky nejprve rozdělte.",
            ),
          );
          continue;
        }
        await addRecording(file, await fileDuration(file), "", file.name);
      }
    } catch {
      setUploadError(
        t(
          "This file couldn’t be saved. Check your connection and try again.",
          "Soubor se nepodařilo uložit. Zkontrolujte připojení a zkuste to znovu.",
        ),
      );
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <>
      <Link href={`/${meeting.workspaceId}/meetings/${meeting.id}`} className="back-link">
        <ArrowLeft size={16} />
        {t("Meeting details", "Podrobnosti schůzky")}
      </Link>
      <div className="studio-heading">
        <div>
          <div className="eyebrow">
            <span className="tiny-dot" />
            {t("MEETING STUDIO", "STUDIO SCHŮZKY")}
          </div>
          <h1>{meeting.title}</h1>
          <p>{t("Settle in. We’ll remember the details.", "Pohodlně se usaďte. Detaily si zapamatujeme.")}</p>
        </div>
        <Button
          disabled={occupied || (!meeting.recordings.length && !meeting.transcript?.text)}
          onClick={async () => {
            if (await processing.process()) router.push(`/${meeting.workspaceId}/meetings/${meeting.id}`);
          }}
        >
          {processing.busy ? <LoaderCircle size={17} className="spin" /> : <Check size={17} />}
          {t("Finish meeting", "Dokončit schůzku")}
        </Button>
      </div>
      {processing.busy && (
        <div className="info-banner">
          <LoaderCircle size={19} className="spin" />
          {processing.progress}
        </div>
      )}
      {processing.error && (
        <div className="error-banner" role="alert">
          {processing.error}
        </div>
      )}
      <div className="studio-grid">
        <div>
          <RecorderPanel recorder={recorder} occupied={occupied} hasRecordings={meeting.recordings.length > 0} />
          <div
            className={`upload-dropzone ${dragging ? "dragging" : ""}`}
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
            <Upload size={25} />
            <div>
              <strong>{t("Already have a recording?", "Už máte nahrávku?")}</strong>
              <p>
                {t("Drop audio files here, or", "Přetáhněte zvukové soubory sem nebo")}{" "}
                <button disabled={occupied} onClick={() => input.current?.click()}>
                  {t("browse files", "vyberte soubory")}
                </button>
              </p>
              <span>MP3, M4A, WAV, MP4, WebM · {t("up to 25 MB each", "až 25 MB na soubor")}</span>
            </div>
            {uploading && <LoaderCircle className="spin" size={20} />}
            <input
              ref={input}
              type="file"
              multiple
              accept=".mp3,.mp4,.mpeg,.mpga,.m4a,.wav,.webm,.ogg,.flac"
              hidden
              onChange={(event) => {
                if (event.target.files) void upload(event.target.files);
              }}
            />
          </div>
          {uploadError && (
            <div className="error-banner" role="alert">
              {uploadError}
            </div>
          )}
          <SectionHeading title={t("Recordings", "Nahrávky")} count={meeting.recordings.length} />
          {meeting.recordings.length ? (
            <div className="recordings-list">
              {meeting.recordings.map((item) => (
                <RecordingItem key={item.id} recording={item} onDelete={occupied ? undefined : () => setDeleting(item.id)} />
              ))}
            </div>
          ) : (
            <div className="recordings-empty">
              <AudioLines size={21} />
              <span>
                {t(
                  "Your recordings will appear here. Add as many as you need.",
                  "Vaše nahrávky se zobrazí zde. Přidejte jich, kolik potřebujete.",
                )}
              </span>
            </div>
          )}
        </div>
        <StudioContext meeting={meeting} liveText={recorder.liveText} occupied={occupied} />
      </div>
      {deleting && (
        <Modal
          title={t("Remove this recording?", "Odebrat tuto nahrávku?")}
          subtitle={t(
            "The audio file will be deleted from your account. Existing transcripts will stay.",
            "Zvukový soubor bude odstraněn z vašeho účtu. Existující přepisy zůstanou.",
          )}
          onClose={() => setDeleting(null)}
        >
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              {t("Cancel", "Zrušit")}
            </Button>
            <Button
              className="button-danger"
              onClick={async () => {
                try {
                  await deleteRecordings([deleting]);
                  mutateAccount((current) => ({
                    ...current,
                    meetings: current.meetings.map((item) =>
                      item.id === meeting.id ? { ...item, recordings: item.recordings.filter((rec) => rec.id !== deleting) } : item,
                    ),
                  }));
                  setDeleting(null);
                } catch {
                  notify(t("Recording could not be removed. Please try again.", "Nahrávku nelze odebrat. Zkuste to znovu."));
                }
              }}
            >
              {t("Remove", "Odebrat")}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
