"use client";
import { Mic, Pause, Play, ShieldCheck, Square } from "lucide-react";
import { useMinute } from "./minute-provider";
import { Button } from "./ui/button";
import { clockLabel } from "@/lib/utils";
import type { useRecorder } from "@/lib/use-recorder";

export function RecorderPanel({
  recorder,
  occupied,
  hasRecordings,
}: {
  recorder: ReturnType<typeof useRecorder>;
  occupied: boolean;
  hasRecordings: boolean;
}) {
  const { t } = useMinute();
  const recording = recorder.status === "recording" || recorder.status === "paused";
  const recorderError =
    recorder.error === "limit"
      ? t(
          "This take reached the size limit and was saved. Start another take to keep going.",
          "Tento záznam dosáhl limitu a byl uložen. Pokračujte novým záznamem.",
        )
      : recorder.error === "permission"
        ? t(
            "Microphone access was denied. Allow it in your browser’s site settings and try again.",
            "Přístup k mikrofonu byl zamítnut. Povolte ho v nastavení webu a zkuste to znovu.",
          )
        : recorder.error === "unsupported"
          ? t(
              "Microphone recording needs HTTPS and a supported browser. You can still upload recordings.",
              "Nahrávání vyžaduje HTTPS a podporovaný prohlížeč. Stále můžete nahrát soubory.",
            )
          : recorder.error === "save"
            ? t(
                "The recording couldn’t be saved. Check your device storage.",
                "Nahrávku se nepodařilo uložit. Zkontrolujte úložiště zařízení.",
              )
            : t(
                "We couldn’t use your microphone. Check that it’s connected and try again.",
                "Mikrofon není dostupný. Zkontrolujte připojení a zkuste to znovu.",
              );
  return (
    <section className={`recorder-panel ${recording ? "recorder-active" : ""}`}>
      <div className="recorder-label">
        <span className={recording ? "recording-dot" : "idle-dot"} />
        {recorder.status === "recording"
          ? t("RECORDING", "NAHRÁVÁM")
          : recorder.status === "paused"
            ? t("PAUSED", "POZASTAVENO")
            : t("READY WHEN YOU ARE", "PŘIPRAVENO, AŽ BUDETE VY")}
      </div>
      <div className="recorder-wave" aria-hidden="true">
        {Array.from({ length: 43 }, (_, index) => (
          <i
            key={index}
            style={{
              height: `${recording ? 8 + Math.sin(index * 0.9) ** 2 * 52 : 4 + Math.sin(index * 0.9) ** 2 * 13}px`,
              animationDelay: `${index * 0.057}s`,
              animationPlayState: recorder.status === "recording" ? "running" : "paused",
            }}
          />
        ))}
      </div>
      <div className="recorder-time">{clockLabel(recorder.seconds)}</div>
      <p>
        {recording
          ? t("Stay in the conversation. Your audio is being captured.", "Věnujte se rozhovoru. Zvuk se zaznamenává.")
          : t("One click. Every word. Nothing missed.", "Jedno kliknutí. Každé slovo. Nic neunikne.")}
      </p>
      <div className="record-controls">
        {recording ? (
          <>
            <Button variant="secondary" onClick={recorder.pause}>
              {recorder.status === "paused" ? <Play size={17} /> : <Pause size={17} />}
              {recorder.status === "paused" ? t("Resume", "Pokračovat") : t("Pause", "Pozastavit")}
            </Button>
            <Button className="button-record-stop" onClick={recorder.stop}>
              <Square size={14} fill="currentColor" />
              {t("Stop recording", "Zastavit nahrávání")}
            </Button>
          </>
        ) : (
          <Button onClick={recorder.start} disabled={occupied || !!recorder.recovery}>
            <Mic size={18} />
            {recorder.requesting
              ? t("Connecting microphone…", "Připojuji mikrofon…")
              : recorder.status === "saving"
                ? t("Saving…", "Ukládám…")
                : hasRecordings
                  ? t("Record another take", "Nahrát další záznam")
                  : t("Start recording", "Začít nahrávat")}
          </Button>
        )}
      </div>
      <div className="recorder-consent">
        <ShieldCheck size={13} />
        {t("Let everyone know you’re recording before you start.", "Než začnete, informujte účastníky o nahrávání.")}
      </div>
      {recorder.error && (
        <div className="inline-error" role="alert">
          {recorderError}
        </div>
      )}
      {recorder.recovery && (
        <div className="record-controls" style={{ marginTop: 14 }}>
          <Button variant="secondary" disabled={recorder.status === "saving"} onClick={recorder.retrySave}>
            {t("Retry saving", "Zkusit uložit znovu")}
          </Button>
          <a
            className="button button-secondary"
            href={recorder.recovery.url}
            download={`minute-recovery.${recorder.recovery.blob.type.includes("mp4") ? "m4a" : "webm"}`}
          >
            {t("Download audio", "Stáhnout zvuk")}
          </a>
        </div>
      )}
    </section>
  );
}
