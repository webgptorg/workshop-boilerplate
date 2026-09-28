"use client";
import { Globe2, Users } from "lucide-react";
import { Avatar } from "./shared";
import { useMinute } from "./minute-provider";
import type { Meeting } from "@/lib/types";

export function MeetingPeople({ meeting }: { meeting: Meeting }) {
  const { t } = useMinute();
  return (
    <>
      <div className="property-block">
        <span>
          <Users size={15} />
          {t("Participants", "Účastníci")}
        </span>
        <div className="participant-list">
          {meeting.participants.map((name, i) => (
            <div key={name}>
              <Avatar small name={name} index={i} />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="property-block">
        <span>
          <Globe2 size={15} />
          {t("Languages", "Jazyky")}
        </span>
        <div className="language-tags">
          {meeting.languages.map((language) => (
            <span key={language}>{language === "en" ? t("English", "Angličtina") : t("Czech", "Čeština")}</span>
          ))}
        </div>
      </div>
    </>
  );
}
