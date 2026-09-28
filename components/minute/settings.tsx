"use client";
import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { useMinute } from "./provider";
import { Avatar, ExportMenu } from "./shared";
import { Icon } from "./icon";
export function Settings() {
  const {
    user,
    workspace,
    language,
    setLanguage,
    dark,
    setDark,
    t,
    updateWorkspace,
    notify,
    logout,
  } = useMinute();
  const [name, setName] = useState(workspace?.name || "");
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {t("MAKE YOURSELF AT HOME", "CÍTIT SE JAKO DOMA")}
          </span>
          <h1>{t("Your space, your way.", "Váš prostor podle vás.")}</h1>
        </div>
      </div>
      <div className="settings-grid">
        <Card className="settings-card">
          <h2>{t("Workspace", "Pracovní prostor")}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) {
                updateWorkspace((w) => ({ ...w, name: name.trim() }));
                notify(
                  t("Workspace updated.", "Pracovní prostor aktualizován."),
                );
              }
            }}
          >
            <label className="field">
              {t("Workspace name", "Název prostoru")}
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <Button type="submit">{t("Save changes", "Uložit změny")}</Button>
          </form>
        </Card>
        <Card className="settings-card">
          <h2>{t("A comfortable view", "Pohodlné zobrazení")}</h2>
          <div className="settings-row">
            <span>
              <Icon name="globe" size={19} />
              {t("Language", "Jazyk")}
            </span>
            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value === "cs" ? "cs" : "en")
              }
              aria-label="App language"
            >
              <option value="en">English</option>
              <option value="cs">Čeština</option>
            </select>
          </div>
          <div className="settings-row">
            <span>
              <Icon name={dark ? "moon" : "sun"} size={19} />
              {t("Appearance", "Vzhled")}
            </span>
            <div className="filter-tabs">
              <button
                className={!dark ? "selected" : ""}
                onClick={() => setDark(false)}
              >
                <Icon name="sun" size={16} />
                {t("Light", "Světlý")}
              </button>
              <button
                className={dark ? "selected" : ""}
                onClick={() => setDark(true)}
              >
                <Icon name="moon" size={16} />
                {t("Dark", "Tmavý")}
              </button>
            </div>
          </div>
        </Card>
        <Card className="settings-card">
          <h2>{t("Your account", "Váš účet")}</h2>
          <div className="settings-account">
            <Avatar name={user?.name || ""} />
            <span>
              <strong>{user?.name}</strong>
              <small>{user?.email}</small>
            </span>
            <span className="category-badge category-meeting">Demo</span>
          </div>
          <p className="small muted">
            {t(
              "Local demo account. Workspaces are separate for each user. Use demo-only passwords.",
              "Místní demo účet. Každý uživatel má oddělené prostory. Používejte pouze demo hesla.",
            )}
          </p>
          <Button variant="secondary" onClick={logout}>
            <Icon name="logout" size={16} />
            {t("Sign out / switch user", "Odhlásit / změnit uživatele")}
          </Button>
        </Card>
        <Card className="settings-card">
          <h2>{t("Your data", "Vaše data")}</h2>
          <div className="storage-info">
            <Icon name="lock" size={22} />
            <p>
              {t(
                "Calls and tasks are saved in local storage. Audio is saved in this browser’s IndexedDB. Clearing browser data removes both. Export important notes to keep a copy.",
                "Hovory a úkoly se ukládají místně. Zvuk se ukládá do IndexedDB prohlížeče. Vymazáním dat prohlížeče odstraníte obojí. Důležité poznámky si exportujte.",
              )}
            </p>
          </div>
          <ExportMenu />
        </Card>
      </div>
    </>
  );
}
