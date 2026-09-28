"use client";

import { Check } from "lucide-react";
import type { Language } from "@/lib/types";
import { useMinute } from "../minute-provider";

export function LanguagePicker({ value, onChange }: { value: Language[]; onChange: (value: Language[]) => void }) {
  const { t } = useMinute();
  return (
    <div className="language-options">
      {(["en", "cs"] as const).map((language) => (
        <button
          type="button"
          key={language}
          className={`language-option ${value.includes(language) ? "selected" : ""}`}
          aria-pressed={value.includes(language)}
          onClick={() => {
            if (value.includes(language)) {
              if (value.length > 1) onChange(value.filter((item) => item !== language));
            } else onChange([...value, language]);
          }}
        >
          <span>{language === "en" ? "🇬🇧" : "🇨🇿"}</span>
          {language === "en" ? t("English", "Angličtina") : t("Czech", "Čeština")}
          {value.includes(language) && <Check size={15} />}
        </button>
      ))}
    </div>
  );
}
