"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui";
import { useMinute } from "./provider";
import { Avatar, Modal } from "./shared";
import { Icon, Logo, type IconName } from "./icon";

export function Shell({
  page,
  children,
  onAction,
}: {
  page: string;
  children: ReactNode;
  onAction: (id: string) => void;
}) {
  const {
    workspace,
    data,
    user,
    t,
    createNewWorkspace,
    dark,
    setDark,
    logout,
  } = useMinute();
  const router = useRouter();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mobile, setMobile] = useState(false);
  const [profile, setProfile] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const base = `/${workspace?.id || "personal"}`;
  const nav: { id: string; label: string; icon: IconName; path: string }[] = [
    {
      id: "overview",
      label: t("Overview", "Přehled"),
      icon: "home",
      path: base,
    },
    {
      id: "calls",
      label: t("All calls", "Všechny hovory"),
      icon: "calls",
      path: `${base}/calls`,
    },
    {
      id: "actions",
      label: t("Action items", "Úkoly"),
      icon: "check",
      path: `${base}/actions`,
    },
    {
      id: "favorites",
      label: t("Favorites", "Oblíbené"),
      icon: "star",
      path: `${base}/favorites`,
    },
  ];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const currentLabel =
    nav.find((n) => n.id === page)?.label ||
    (page === "settings"
      ? t("Settings", "Nastavení")
      : page === "recording"
        ? t("Recording studio", "Nahrávací studio")
        : t("Call notes", "Poznámky hovoru"));
  const matches = query.trim().toLocaleLowerCase();
  const calls =
    workspace?.calls.filter((c) =>
      `${c.title} ${c.summary} ${c.notes}`
        .toLocaleLowerCase()
        .includes(matches),
    ) || [];
  const actions =
    workspace?.actions.filter((a) =>
      `${a.title} ${a.description}`.toLocaleLowerCase().includes(matches),
    ) || [];
  return (
    <div className="app-shell">
      {mobile && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? "sidebar-open" : ""}`}>
        <Link className="logo-link" href={base} aria-label="Minute home">
          <Logo />
        </Link>
        <div className="workspace-switcher dropdown-wrap">
          <button
            className="workspace-select"
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            aria-expanded={workspaceOpen}
          >
            <span className="workspace-letter">
              {workspace?.name[0] || "P"}
            </span>
            <span className="workspace-info">
              <strong>
                {workspace?.name || t("Workspace", "Pracovní prostor")}
              </strong>
              <small>{t("Your personal space", "Váš osobní prostor")}</small>
            </span>
            <Icon name="chevron" size={14} className="rotate-90" />
          </button>
          {workspaceOpen && (
            <>
              <button
                className="menu-dismiss"
                aria-label="Close workspace menu"
                onClick={() => setWorkspaceOpen(false)}
              />
              <div className="dropdown workspace-menu">
                {data.workspaces.map((w) => (
                  <Link
                    key={w.id}
                    href={`/${w.id}`}
                    onClick={() => setWorkspaceOpen(false)}
                  >
                    <span className="workspace-letter small-letter">
                      {w.name[0]}
                    </span>
                    {w.name}
                    {w.id === workspace?.id && (
                      <Icon name="checkmark" size={16} />
                    )}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setWorkspaceOpen(false);
                    setCreateOpen(true);
                  }}
                >
                  <Icon name="plus" size={17} />
                  {t("New workspace", "Nový prostor")}
                </button>
              </div>
            </>
          )}
        </div>
        <a
          className="button button-primary new-call-button"
          href={`${base}/recording`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="plus" size={20} />
          {t("New call", "Nový hovor")}
        </a>
        <div className="nav-label">{t("WORKSPACE", "PRACOVNÍ PROSTOR")}</div>
        <nav
          className="main-nav"
          aria-label={t("Workspace navigation", "Navigace prostoru")}
        >
          {nav.map((item) => (
            <Link
              key={item.id}
              href={item.path}
              className={`nav-item ${page === item.id || (page === "call" && item.id === "calls") ? "active" : ""}`}
              onClick={() => setMobile(false)}
              aria-current={page === item.id ? "page" : undefined}
            >
              <Icon name={item.icon} size={21} />
              <span>{item.label}</span>
              {item.id === "actions" && (
                <span className="count-badge">
                  {workspace?.actions.filter((a) => !a.completed).length || 0}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-note">
          <div className="little-flower" aria-hidden="true">
            <Icon name="lock" size={20} />
          </div>
          <p>{t("Saved on this device.", "Uloženo na tomto zařízení.")}</p>
          <span>{t("YOUR LOCAL WORKSPACE", "VÁŠ MÍSTNÍ PROSTOR")}</span>
        </div>
        <div className="sidebar-bottom">
          <Link
            href={`${base}/settings`}
            className={`nav-item ${page === "settings" ? "active" : ""}`}
            onClick={() => setMobile(false)}
          >
            <Icon name="settings" />
            {t("Settings", "Nastavení")}
          </Link>
          <button className="nav-item" onClick={() => setHelpOpen(true)}>
            <Icon name="help" />
            {t("A little help", "Malá nápověda")}
          </button>
          <div className="sidebar-user">
            <Avatar name={user?.name || "Alex"} />
            <span>
              <strong>{user?.name || "Alex Morgan"}</strong>
              <small>{t("Personal account", "Osobní účet")}</small>
            </span>
            <button
              className="icon-button"
              onClick={() => setDark(!dark)}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <Icon name={dark ? "sun" : "moon"} size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Icon name="menu" />
            </button>
            <Link href={base} aria-label="Workspace home">
              <Icon name="home" size={19} />
            </Link>
            <Link href={base} className="breadcrumb-workspace">
              {t("Workspace", "Pracovní prostor")}
            </Link>
            <Icon name="chevron" size={13} />
            {page === "call" && (
              <>
                <Link href={`${base}/calls`}>
                  {t("All calls", "Všechny hovory")}
                </Link>
                <Icon name="chevron" size={13} />
              </>
            )}
            <span className="breadcrumb-current">{currentLabel}</span>
          </div>
          <div className="topbar-right">
            <button
              className="search-trigger"
              aria-label={t("Search workspace", "Hledat v prostoru")}
              onClick={() => setSearchOpen(true)}
            >
              <Icon name="search" size={19} />
              <span>{t("Search anything…", "Hledat…")}</span>
              <kbd>⌘ K</kbd>
            </button>
            <div className="topbar-divider" />
            <div className="dropdown-wrap">
              <button
                className="profile-button"
                onClick={() => setProfile(!profile)}
                aria-label="Account menu"
                aria-expanded={profile}
              >
                <Avatar name={user?.name || "Alex"} />
              </button>
              {profile && (
                <>
                  <button
                    className="menu-dismiss"
                    aria-label="Close account menu"
                    onClick={() => setProfile(false)}
                  />
                  <div className="dropdown profile-menu">
                    <div className="profile-info">
                      <strong>{user?.name}</strong>
                      <small>{user?.email}</small>
                    </div>
                    <button
                      onClick={() => {
                        setProfile(false);
                        router.push(`${base}/settings`);
                      }}
                    >
                      <Icon name="settings" size={16} />
                      {t("Account settings", "Nastavení účtu")}
                    </button>
                    <button onClick={logout}>
                      <Icon name="logout" size={16} />
                      {t(
                        "Sign out / switch user",
                        "Odhlásit / změnit uživatele",
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <main
          className={`page-content ${page === "recording" ? "studio-content" : ""}`}
        >
          {children}
        </main>
        <footer className="app-footer">
          <span>
            <span className="status-dot" />
            {t("A little more present.", "O něco více přítomní.")}
          </span>
          <a href="https://www.ptbk.io/" target="_blank" rel="noreferrer">
            {t("Made with", "Vytvořeno s")} <strong>Promptbook</strong>
            <Icon name="arrow" size={14} />
          </a>
        </footer>
      </div>
      {createOpen && (
        <Modal
          title={t("New workspace", "Nový pracovní prostor")}
          onClose={() => setCreateOpen(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) {
                const id = createNewWorkspace(name.trim());
                router.push(`/${id}`);
                setCreateOpen(false);
                setName("");
              }
            }}
          >
            <label className="field">
              {t("Workspace name", "Název prostoru")}
              <input
                autoFocus
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("e.g. Studio projects", "např. Projekty studia")}
              />
            </label>
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setCreateOpen(false)}>
                {t("Cancel", "Zrušit")}
              </Button>
              <Button type="submit">
                {t("Create workspace", "Vytvořit prostor")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {helpOpen && (
        <Modal
          title={t("Make the most of your Minute.", "Využijte Minute naplno.")}
          onClose={() => setHelpOpen(false)}
        >
          <div className="help-steps">
            {[
              [
                "mic",
                t("Record or upload", "Nahrávejte nebo nahrajte soubor"),
                t(
                  "Open New call. Pause, resume, and add multiple audio or video files to one call.",
                  "Otevřete Nový hovor. Nahrávání lze pozastavit a do hovoru přidat více souborů.",
                ),
              ],
              [
                "file",
                t("Keep the useful bits", "Zachovejte to podstatné"),
                t(
                  "Use live browser transcription where supported, or add a transcript. Generate an editable draft of notes and tasks.",
                  "Použijte přepis prohlížeče, nebo vložte vlastní. Vygenerujte upravitelný návrh poznámek a úkolů.",
                ),
              ],
              [
                "check",
                t("Follow through", "Dotáhněte úkoly"),
                t(
                  "Set due dates, add subtasks, link related items, and connect the same task to several calls.",
                  "Nastavte termíny, přidejte podúkoly a propojte úkol s více hovory.",
                ),
              ],
              [
                "download",
                t("Take it with you", "Vezměte si data s sebou"),
                t(
                  "Export Markdown or CSV. For PDF, choose Save as PDF in the print dialog. All demo data is stored in this browser.",
                  "Exportujte Markdown nebo CSV. Pro PDF zvolte Uložit jako PDF v tisku. Demo data jsou v tomto prohlížeči.",
                ),
              ],
            ].map(([icon, title, text]) => (
              <div key={title}>
                <span className="help-icon">
                  <Icon name={icon as IconName} />
                </span>
                <section>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </section>
              </div>
            ))}
          </div>
        </Modal>
      )}
      {searchOpen && (
        <Modal
          title={t("Find a little something", "Najděte, co potřebujete")}
          onClose={() => {
            setSearchOpen(false);
            setQuery("");
          }}
        >
          <div className="search-input-wrap">
            <Icon name="search" />
            <input
              ref={searchRef}
              autoFocus
              placeholder={t(
                "Search calls, notes, and action items…",
                "Hledat hovory, poznámky a úkoly…",
              )}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="search-results">
            <span className="eyebrow">{t("CALLS", "HOVORY")}</span>
            {calls.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href={`${base}/calls/${c.id}`}
                onClick={() => setSearchOpen(false)}
              >
                <Icon name="calls" size={18} />
                <span>{c.title}</span>
                <Icon name="arrow" size={15} />
              </Link>
            ))}
            <span className="eyebrow">{t("ACTION ITEMS", "ÚKOLY")}</span>
            {actions.slice(0, 5).map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setSearchOpen(false);
                  onAction(a.id);
                }}
              >
                <Icon name="check" size={18} />
                <span>{a.title}</span>
                <Icon name="arrow" size={15} />
              </button>
            ))}
            {!calls.length && !actions.length && (
              <p className="muted">
                {t(
                  "No results. Try a different word.",
                  "Nic nenalezeno. Zkuste jiné slovo.",
                )}
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
