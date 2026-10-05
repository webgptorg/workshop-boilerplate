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
import { AUDIO_UPLOAD_LIMITS, isAudioUploadDurationAllowed, isAudioUploadSizeAllowed } from "@/lib/audio-upload-configuration";
import { getAudioFileDuration } from "@/lib/audio-file-duration";
import type { Meeting, Recording } from "@/lib/types";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";
import { SectionHeading } from "./shared";
import { RecordingItem } from "./recording-item";
import { RecorderPanel } from "./recorder-panel";
import { StudioContext } from "./studio-context";

export function MeetingStudio({ meeting }: { meeting: Meeting }) {
  const { t: translateMessage, notify } = useMinute();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const processing = useMeetingProcessing(meeting);

  async function addRecording(blob: Blob, duration: number, transcript = "", name?: string) {
    const id = uid();
    await saveRecording(id, blob);
    const recording: Recording = {
      id,
      name: name ?? `${translateMessage("Recording", "Nahrávka")} ${meeting.recordings.length + 1}.${blob.type.includes("mp4") ? "m4a" : "webm"}`,
      mimeType: blob.type,
      size: blob.size,
      duration,
      createdAt: new Date().toISOString(),
      liveTranscript: transcript || undefined,
    };
    mutate((current) => ({
      ...current,
      meetings: current.meetings.map((item) =>
        item.id === meeting.id ? { ...item, status: "in-progress", recordings: [...item.recordings, recording] } : item,
      ),
    }));
    notify(translateMessage("Recording saved", "Nahrávka uložena"));
  }
  const recorder = useRecorder(meeting.languages[0], addRecording);
  const START_RECORDING = recorder.start;
  useEffect(() => {
    if (!consumeRecordingStart(meeting.id)) return;
    void START_RECORDING();
  }, [meeting.id, START_RECORDING]);
  const isRecording = recorder.status === "recording" || recorder.status === "paused";
  const isOccupied = isRecording || recorder.status === "saving" || !!recorder.recovery || processing.busy || isUploading || recorder.requesting;

  async function upload(files: FileList | File[]) {
    if (isOccupied) return;
    setIsUploading(true);
    setUploadError("");
    try {
      for (const file of Array.from(files)) {
        if (!/\.(mp3|mp4|mpeg|mpga|m4a|wav|webm|ogg|flac)$/i.test(file.name)) {
          setUploadError(
            translateMessage("Choose an MP3, MP4, M4A, WAV, WebM, OGG, or FLAC file.", "Vyberte soubor MP3, MP4, M4A, WAV, WebM, OGG nebo FLAC."),
          );
          continue;
        }
        if (!isAudioUploadSizeAllowed(file.size)) {
          setUploadError(
            translateMessage(
              `Each file must be between 1 byte and ${AUDIO_UPLOAD_LIMITS.maxSizeMegabytes} MB. Split larger recordings before uploading.`,
              `Každý soubor musí mít 1 bajt až ${AUDIO_UPLOAD_LIMITS.maxSizeMegabytes} MB. Větší nahrávky nejprve rozdělte.`,
            ),
          );
          continue;
        }
        const DURATION = await getAudioFileDuration(file);
        if (DURATION === null) {
          setUploadError(translateMessage(
            "Could not read this recording’s duration. Choose a playable audio file with duration metadata.",
            "Nelze zjistit délku nahrávky. Vyberte přehratelný zvukový soubor s údajem o délce.",
          ));
          continue;
        }
        if (!isAudioUploadDurationAllowed(DURATION)) {
          setUploadError(translateMessage(
            `Each recording must be no longer than ${AUDIO_UPLOAD_LIMITS.maxDurationHours} h. Split longer recordings before uploading.`,
            `Každá nahrávka může mít nejvýše ${AUDIO_UPLOAD_LIMITS.maxDurationHours} h. Delší nahrávky nejprve rozdělte.`,
          ));
          continue;
        }
        await addRecording(file, DURATION, "", file.name);
      }
    } catch {
      setUploadError(
        translateMessage(
          "This file couldn’t be saved. Check your device storage and try again.",
          "Soubor se nepodařilo uložit. Zkontrolujte úložiště zařízení a zkuste to znovu.",
        ),
      );
    } finally {
      setIsUploading(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <>
      <Link href={`/${meeting.workspaceId}/meetings/${meeting.id}`} className="back-link">
        <ArrowLeft size={16} />
        {translateMessage("Meeting details", "Podrobnosti schůzky")}
      </Link>
      <div className="studio-heading">
        <div>
          <div className="eyebrow">
            <span className="tiny-dot" />
            {translateMessage("MEETING STUDIO", "STUDIO SCHŮZKY")}
          </div>
          <h1>{meeting.title}</h1>
          <p>{translateMessage("Settle in. We’ll remember the details.", "Pohodlně se usaďte. Detaily si zapamatujeme.")}</p>
        </div>
        <Button
          disabled={isOccupied || (!meeting.recordings.length && !meeting.transcript?.text)}
          onClick={async () => {
            if (await processing.process()) router.push(`/${meeting.workspaceId}/meetings/${meeting.id}`);
          }}
        >
          {processing.busy ? <LoaderCircle size={17} className="spin" /> : <Check size={17} />}
          {translateMessage("Finish meeting", "Dokončit schůzku")}
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
          <RecorderPanel recorder={recorder} occupied={isOccupied} hasRecordings={meeting.recordings.length > 0} />
          <div
            className={`upload-dropzone ${isDragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              void upload(e.dataTransfer.files);
            }}
          >
            <Upload size={25} />
            <div>
              <strong>{translateMessage("Already have a recording?", "Už máte nahrávku?")}</strong>
              <p>
                {translateMessage("Drop audio files here, or", "Přetáhněte zvukové soubory sem nebo")}{" "}
                <button disabled={isOccupied} onClick={() => input.current?.click()}>
                  {translateMessage("browse files", "vyberte soubory")}
                </button>
              </p>
              <span>MP3, M4A, WAV, MP4, WebM · {translateMessage(
                `up to ${AUDIO_UPLOAD_LIMITS.maxSizeMegabytes} MB and ${AUDIO_UPLOAD_LIMITS.maxDurationHours} h each`,
                `až ${AUDIO_UPLOAD_LIMITS.maxSizeMegabytes} MB a ${AUDIO_UPLOAD_LIMITS.maxDurationHours} h na soubor`,
              )}</span>
            </div>
            {isUploading && <LoaderCircle className="spin" size={20} />}
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
          <SectionHeading title={translateMessage("Recordings", "Nahrávky")} count={meeting.recordings.length} />
          {meeting.recordings.length ? (
            <div className="recordings-list">
              {meeting.recordings.map((item) => (
                <RecordingItem key={item.id} recording={item} onDelete={isOccupied ? undefined : () => setDeleting(item.id)} />
              ))}
            </div>
          ) : (
            <div className="recordings-empty">
              <AudioLines size={21} />
              <span>
                {translateMessage(
                  "Your recordings will appear here. Add as many as you need.",
                  "Vaše nahrávky se zobrazí zde. Přidejte jich, kolik potřebujete.",
                )}
              </span>
            </div>
          )}
        </div>
        <StudioContext meeting={meeting} liveText={recorder.liveText} occupied={isOccupied} />
      </div>
      {deleting && (
        <Modal
          title={translateMessage("Remove this recording?", "Odebrat tuto nahrávku?")}
          subtitle={translateMessage(
            "The audio file will be deleted from this device. Existing transcripts will stay.",
            "Zvukový soubor bude odstraněn z tohoto zařízení. Existující přepisy zůstanou.",
          )}
          onClose={() => setDeleting(null)}
        >
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              {translateMessage("Cancel", "Zrušit")}
            </Button>
            <Button
              className="button-danger"
              onClick={async () => {
                try {
                  await deleteRecordings([deleting]);
                  mutate((current) => ({
                    ...current,
                    meetings: current.meetings.map((item) =>
                      item.id === meeting.id ? { ...item, recordings: item.recordings.filter((rec) => rec.id !== deleting) } : item,
                    ),
                  }));
                  setDeleting(null);
                } catch {
                  notify(translateMessage("Recording could not be removed. Please try again.", "Nahrávku nelze odebrat. Zkuste to znovu."));
                }
              }}
            >
              {translateMessage("Remove", "Odebrat")}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
