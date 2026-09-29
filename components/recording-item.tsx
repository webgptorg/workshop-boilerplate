"use client";

import { useEffect, useState } from "react";
import { AudioLines, Download, Trash2 } from "lucide-react";
import { getRecording } from "@/lib/media";
import { clockLabel } from "@/lib/utils";
import type { Recording } from "@/lib/types";
import { useMinute } from "./minute-provider";

export function RecordingItem({ recording, onDelete }: { recording: Recording; onDelete?: () => void }) {
  const { t } = useMinute();
  const [url, setUrl] = useState("");
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    let active = true;
    let objectUrl = "";
    getRecording(recording.id)
      .then((blob) => {
        if (!active) return;
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        } else setMissing(true);
      })
      .catch(() => {
        if (active) setMissing(true);
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [recording.id]);
  return (
    <div className="recording-item">
      <div className="recording-item-heading">
        <span className="meeting-symbol cyan">
          <AudioLines size={18} />
        </span>
        <div>
          <strong>{recording.name}</strong>
          <span>
            {clockLabel(recording.duration)} · {(recording.size / 1024 / 1024).toFixed(1)} MB
          </span>
        </div>
        {url && (
          <a className="icon-button" href={url} download={recording.name} aria-label={t("Download recording", "Stáhnout nahrávku")}>
            <Download size={16} />
          </a>
        )}
        {onDelete && (
          <button className="icon-button danger" aria-label={t("Remove recording", "Odebrat nahrávku")} onClick={onDelete}>
            <Trash2 size={16} />
          </button>
        )}
      </div>
      {url && <audio controls preload="metadata" src={url} aria-label={recording.name} />}
      {missing && (
        <p className="inline-error">
          {t(
            "This recording is not available in your account. Add the original file again.",
            "Tato nahrávka není ve vašem účtu dostupná. Přidejte původní soubor znovu.",
          )}
        </p>
      )}
    </div>
  );
}
