"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Globe2, HardDrive, Laptop, Layers2, Moon, Pencil, ShieldCheck, Sun, Upload, UserRound } from "lucide-react";
import { useMinute } from "./minute-provider";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";
import { PageHeading } from "./shared";
import { WorkspaceDialog } from "./forms/workspace-dialog";
import { mutate, isAppState, flushStore, reloadStoreFromDatabase } from "@/lib/store";
import { getSupabase } from "@/lib/supabase";
import { dayKey, downloadText } from "@/lib/utils";
import type { AppState, Language, Theme, Workspace } from "@/lib/types";

export function SettingsView({ workspace }: { workspace: Workspace }) {
  const { state, t, notify } = useMinute();
  const router = useRouter();
  const [editWorkspace, setEditWorkspace] = useState(false);
  const [isReloadingData, setIsReloadingData] = useState(false);
  const [importData, setImportData] = useState<AppState | null>(null);
  const input = useRef<HTMLInputElement>(null);
  async function readImport(file: File) {
    try {
      if (file.size > 20 * 1024 * 1024) throw new Error("too_large");
      const parsed: unknown = JSON.parse(await file.text());
      if (!isAppState(parsed)) throw new Error("invalid");
      setImportData(parsed);
    } catch {
      notify(
        t(
          "This isn’t a valid Minute backup. Choose a JSON file exported from Settings.",
          "Toto není platná záloha Minute. Vyberte JSON exportovaný z Nastavení.",
        ),
      );
    }
    if (input.current) input.current.value = "";
  }
  return (
    <>
      <PageHeading
        eyebrow={t("MAKE MINUTE YOURS", "MINUTE PODLE VÁS")}
        title={t("Settings", "Nastavení")}
        subtitle={t(
          "A few small things that make this space feel like yours.",
          "Pár drobností, se kterými bude tento prostor opravdu váš.",
        )}
      />
      <div className="settings-stack">
        <section className="settings-card">
          <div className="settings-title">
            <UserRound size={21} />
            <div>
              <h2>{t("Your profile", "Váš profil")}</h2>
              <p>{t("One personal account, as many workspaces as you need.", "Jeden osobní účet, tolik prostorů, kolik potřebujete.")}</p>
            </div>
          </div>
          <form
            className="profile-form"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const name = String(data.get("name")).trim();
              if (name) {
                mutate((current) => ({ ...current, user: { ...current.user, name } }));
                notify(t("Profile saved", "Profil uložen"));
              }
            }}
          >
            <label className="field-label">
              {t("Your name", "Vaše jméno")}
              <input key={state.user.name} name="name" defaultValue={state.user.name} required maxLength={80} />
            </label>
            <label className="field-label">
              {t("Email", "E-mail")}
              <input aria-label={t("Email", "E-mail")} value={state.user.email} readOnly />
              <span className="field-hint">{t("Signed in with email and password", "Přihlášeno e-mailem a heslem")}</span>
            </label>
            <Button variant="secondary" type="submit">
              {t("Save profile", "Uložit profil")}
            </Button>
          </form>
        </section>
        <section className="settings-card">
          <div className="settings-title">
            <Sun size={21} />
            <div>
              <h2>{t("Look & language", "Vzhled a jazyk")}</h2>
              <p>
                {t(
                  "Your preferences follow you across workspaces on this device.",
                  "Vaše předvolby platí ve všech prostorech na tomto zařízení.",
                )}
              </p>
            </div>
          </div>
          <div className="settings-row">
            <div>
              <strong>{t("Appearance", "Vzhled")}</strong>
              <p>{t("Find your comfortable setting.", "Vyberte si příjemné prostředí.")}</p>
            </div>
            <div className="theme-options">
              {(
                [
                  { value: "light", icon: Sun, label: t("Light", "Světlý") },
                  { value: "dark", icon: Moon, label: t("Dark", "Tmavý") },
                  { value: "system", icon: Laptop, label: t("System", "Systém") },
                ] satisfies { value: Theme; icon: typeof Sun; label: string }[]
              ).map((option) => (
                <button
                  key={option.value}
                  className={state.user.theme === option.value ? "selected" : ""}
                  aria-pressed={state.user.theme === option.value}
                  onClick={() => mutate((current) => ({ ...current, user: { ...current.user, theme: option.value } }))}
                >
                  <option.icon size={18} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-row">
            <div>
              <strong>{t("App language", "Jazyk aplikace")}</strong>
              <p>{t("This changes the interface, not your meeting languages.", "Změní jazyk rozhraní. Jazyky schůzek se nemění.")}</p>
            </div>
            <label className="language-select">
              <Globe2 size={17} />
              <select
                aria-label={t("App language", "Jazyk aplikace")}
                value={state.user.language}
                onChange={(event) =>
                  mutate((current) => ({ ...current, user: { ...current.user, language: event.target.value as Language } }))
                }
              >
                <option value="en">English</option>
                <option value="cs">Čeština</option>
              </select>
            </label>
          </div>
        </section>
        <section className="settings-card">
          <div className="settings-title">
            <Layers2 size={21} />
            <div>
              <h2>{t("This workspace", "Tento pracovní prostor")}</h2>
              <p>{t("A home for connected conversations.", "Domov pro související rozhovory.")}</p>
            </div>
            <Button variant="secondary" onClick={() => setEditWorkspace(true)}>
              <Pencil size={14} />
              {t("Edit", "Upravit")}
            </Button>
          </div>
          <div className="settings-row">
            <div>
              <strong>{workspace.name}</strong>
              <p>{workspace.description}</p>
            </div>
            <div className="language-tags">
              {workspace.languages.map((language) => (
                <span key={language}>{language === "en" ? t("English", "Angličtina") : t("Czech", "Čeština")}</span>
              ))}
            </div>
          </div>
        </section>
        <section className="settings-card">
          <div className="settings-title">
            <HardDrive size={21} />
            <div>
              <h2>{t("Your data, in your hands", "Vaše data ve vašich rukou")}</h2>
              <p>
                {t(
                  "Workspaces sync to your Supabase account. Recordings stay on this device.",
                  "Prostory se synchronizují s vaším účtem Supabase. Nahrávky zůstávají na tomto zařízení.",
                )}
              </p>
            </div>
          </div>
          <div className="info-banner">
            <ShieldCheck size={20} />
            <span>
              {t(
                "Audio is sent for transcription when you finish a meeting. Transcripts are sent to generate summaries and todos. Your API key stays on the server.",
                "Po dokončení schůzky se zvuk odesílá k přepisu. Přepisy se odesílají pro vytvoření shrnutí a úkolů. Klíč API zůstává na serveru.",
              )}
            </span>
          </div>
          <div className="settings-row">
            <div>
              <strong>{t("Keep a backup", "Vytvořte si zálohu")}</strong>
              <p>
                {t(
                  "Export all workspaces, transcripts, and todos. Download audio separately from each meeting.",
                  "Exportujte všechny prostory, přepisy a úkoly. Zvuk si stáhněte zvlášť z jednotlivých schůzek.",
                )}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => downloadText(`minute-backup-${dayKey()}.json`, JSON.stringify(state, null, 2), "application/json")}
            >
              <Download size={16} />
              {t("Export data", "Exportovat data")}
            </Button>
          </div>
          <div className="settings-row">
            <div>
              <strong>{t("Restore a backup", "Obnovit zálohu")}</strong>
              <p>{t("Replace saved workspace data with a previous Minute export.", "Nahraďte uložená data předchozím exportem Minute.")}</p>
            </div>
            <Button variant="secondary" onClick={() => input.current?.click()}>
              <Upload size={16} />
              {t("Import data", "Importovat data")}
            </Button>
            <input
              ref={input}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void readImport(file);
              }}
            />
          </div>
        </section>
        <Button variant="secondary" onClick={() => setIsReloadingData(true)}>
          {t("Reload data from Supabase", "Načíst data ze Supabase")}
        </Button>
        <Button variant="secondary" onClick={async () => {
          try {
            await flushStore();
            const { error } = await getSupabase().auth.signOut();
            if (error) throw error;
          } catch {
            notify(t("Could not log out. Reconnect and save your changes before trying again.", "Odhlášení se nezdařilo. Připojte se a uložte změny před dalším pokusem."));
          }
        }}>{t("Log out", "Odhlásit se")}</Button>
        <p className="settings-version">
          minute. <span>v1.0 · {t("A little more present.", "O něco více přítomnosti.")}</span>
        </p>
      </div>
      {isReloadingData && <Modal
        title={t("Replace local changes?", "Nahradit místní změny?")}
        subtitle={t("This loads the latest database version and discards unsynced changes on this device. Export a backup first to keep them.", "Načte nejnovější verzi databáze a zahodí nesynchronizované změny na tomto zařízení. Pro jejich zachování nejprve exportujte zálohu.")}
        onClose={() => setIsReloadingData(false)}
      ><div className="modal-actions">
        <Button variant="secondary" onClick={() => setIsReloadingData(false)}>{t("Cancel", "Zrušit")}</Button>
        <Button onClick={async () => {
          try { await reloadStoreFromDatabase(); setIsReloadingData(false); }
          catch { notify(t("Could not reload data. Check your connection and retry.", "Data se nepodařilo načíst. Zkontrolujte připojení a zkuste to znovu.")); }
        }}>{t("Replace local changes", "Nahradit místní změny")}</Button>
      </div></Modal>}
      {editWorkspace && <WorkspaceDialog workspace={workspace} onClose={() => setEditWorkspace(false)} />}
      {importData && (
        <Modal
          title={t("Restore this backup?", "Obnovit tuto zálohu?")}
          subtitle={`${importData.workspaces.length} ${t("workspaces", "prostorů")}, ${importData.meetings.length} ${t("meetings", "schůzek")}, ${importData.todos.length} ${t("todos", "úkolů")}. ${t("This will replace your current data. Export a backup first if you need it.", "Tím nahradíte současná data. Pokud je potřebujete, nejprve je exportujte.")}`}
          onClose={() => setImportData(null)}
        >
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setImportData(null)}>
              {t("Cancel", "Zrušit")}
            </Button>
            <Button
              onClick={() => {
                mutate(() => importData);
                router.push(`/${importData.workspaces[0].id}`);
                setImportData(null);
              }}
            >
              {t("Restore backup", "Obnovit zálohu")}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
