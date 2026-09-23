"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  CookingPot,
  Heart,
  Leaf,
  Lightbulb,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  Users,
  Wheat,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BASE,
  cost,
  Data,
  GROUPS,
  INITIAL,
  Plan,
  propose,
  recipe,
  RECIPES,
  RULE_VERSION,
  validData,
  weekDates,
  weekKey,
} from "@/lib/planner";

type View = "plan" | "ideas" | "recipes" | "basket" | "settings";
const money = (n: number) =>
  n.toLocaleString("cs-CZ", { maximumFractionDigits: 1 });
const days = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek"];
const STORAGE = "spolecny-stul-v1";
export function MealPlanner() {
  const dialogRef = useRef<HTMLElement>(null);
  const [data, setData] = useState<Data>(INITIAL);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [view, setView] = useState<View>("plan");
  const [offset, setOffset] = useState(0);
  const [modal, setModal] = useState<
    "idea" | "generate" | "export" | "help" | null
  >(null);
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [activeIdea, setActiveIdea] = useState<string>("");
  const [ideaText, setIdeaText] = useState("");
  const [author, setAuthor] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [rejection, setRejection] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(STORAGE);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (!validData(parsed)) throw new Error("invalid");
          setData(parsed);
        }
      } catch {
        setStorageError(
          "Uložená data nelze načíst. Pracujete s ukázkou; původní data nepřepisujeme.",
        );
      }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (!ready || storageError) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify(data));
    } catch {
      queueMicrotask(() =>
        setStorageError(
          "Změny se nepodařilo uložit do prohlížeče. Exportujte si pracovní plán.",
        ),
      );
    }
  }, [data, ready, storageError]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    function close(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setModal(null);
        setSelectedRecipe(null);
        setRejection(null);
        setEditingDay(null);
      }
    }
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const dialogOpen = Boolean(modal || selectedRecipe || rejection);
  useEffect(() => {
    if (!dialogOpen) return;
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const controls = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, input, textarea, select, [tabindex="0"]',
        ),
      );
    if (!dialog.contains(document.activeElement)) controls()[0]?.focus();
    function trap(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const items = controls();
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [dialogOpen]);
  const key = weekKey(offset);
  const dates = weekDates(key);
  const plan: Plan = data.plans[key] ?? {
    meals: BASE,
    approved: false,
    rules: RULE_VERSION,
  };
  const meals = plan.meals.map(recipe);
  const average = meals.reduce((n, r) => n + cost(r), 0) / 5;
  const pending = data.ideas.filter((i) => i.status === "new");
  const totals = GROUPS.map((group) => ({
    group,
    grams: meals.reduce(
      (sum, r) =>
        sum +
        r.ingredients
          .filter((i) => i.group === group)
          .reduce((s, i) => s + i.grams, 0),
      0,
    ),
  }));
  const title = {
    plan: "Týdenní jídelníček",
    ideas: "Nápady od rodičů",
    recipes: "Katalog receptur",
    basket: "Přehled spotřebního koše",
    settings: "Nastavení jídelny",
  }[view];
  function savePlan(next: Plan) {
    setData((d) => ({
      ...d,
      plans: { ...d.plans, [key]: next },
      ideas: d.ideas.map((i) =>
        i.status === "included" &&
        i.week === key &&
        !next.meals.includes(i.recipeId)
          ? { ...i, status: "new", week: undefined }
          : i,
      ),
    }));
  }
  function generate(ideaId: string) {
    const idea = data.ideas.find((i) => i.id === ideaId);
    const ids = [...BASE];
    if (idea) {
      const existing = ids.indexOf(idea.recipeId);
      if (existing < 0) ids[1] = idea.recipeId;
    }
    setData((d) => ({
      ...d,
      plans: {
        ...d.plans,
        [key]: { meals: ids, approved: false, rules: RULE_VERSION },
      },
      ideas: d.ideas.map((i) =>
        i.id === ideaId
          ? { ...i, status: "included", week: key }
          : i.status === "included" &&
              i.week === key &&
              !ids.includes(i.recipeId)
            ? { ...i, status: "new", week: undefined }
            : i,
      ),
    }));
    setModal(null);
    setView("plan");
    setNotice("Návrh týdne je připravený k vaší kontrole.");
  }
  function exportPlan() {
    const content = [
      `Společný stůl · ${dates[0].toLocaleDateString("cs-CZ")} – ${dates[4].toLocaleDateString("cs-CZ")}`,
      plan.approved ? "Odsouhlasený pracovní návrh" : "Pracovní návrh",
      plan.rules,
      "Odhadové receptury a ceny. Soulad s vyhláškou ani alergeny nejsou ověřeny.",
      ...meals.map(
        (r, n) =>
          `\n${days[n]}: ${r.soup}\n${r.name} · ${r.side}\n${r.ingredients.map((i) => `${i.name}: ${i.grams} g/porce, ${money((i.grams * data.portions) / 1000)} kg celkem`).join("\n")}\nOdhad: ${money(cost(r))} Kč/porce`,
      ),
      ...data.ideas
        .filter((i) => i.week === key)
        .map((i) => `\nNápad: ${i.text}\nOdpověď rodiči: ${i.explanation}`),
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `jidelnicek-${key}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setModal(null);
    setNotice("Jídelníček byl exportován.");
  }
  const nav = [
    { id: "plan" as const, label: "Jídelníček", icon: CalendarDays },
    { id: "ideas" as const, label: "Nápady od rodičů", icon: Lightbulb },
    { id: "recipes" as const, label: "Receptury", icon: BookOpen },
    { id: "basket" as const, label: "Spotřební koš", icon: ClipboardList },
  ];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Společný stůl – domů">
          <span className="brand-icon">
            <Sprout size={26} />
          </span>
          <span>
            společný stůl
            <span className="brand-sub">DOBRÉ JÍDLO. SPOLEČNĚ.</span>
          </span>
        </Link>
        <div className="workspace">
          <span className="school-icon">
            <CookingPot size={20} />
          </span>
          <div>
            <strong>Naše školní jídelna</strong>
            <small>Pracovní prostor</small>
          </div>
          <ChevronRight size={15} />
        </div>
        <div className="nav-caption">PLÁNOVÁNÍ</div>
        <nav aria-label="Hlavní navigace">
          {nav.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${view === n.id ? "active" : ""}`}
              onClick={() => setView(n.id)}
            >
              <n.icon size={19} />
              {n.label}
              {n.id === "ideas" && (
                <span className="nav-count">{pending.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="note-icon">
            <Heart size={19} />
          </span>
          <strong>
            Lepší obědy začínají
            <br />
            dobrým nápadem.
          </strong>
          <p>
            Vy plánujete. Rodiče inspirují.
            <br />
            Děti si pochutnají.
          </p>
          <span className="note-sprout">
            <Sprout size={60} strokeWidth={1} />
          </span>
        </div>
        <div className="sidebar-bottom">
          <button
            className={`nav-item ${view === "settings" ? "active" : ""}`}
            onClick={() => setView("settings")}
          >
            <Settings2 size={18} />
            Nastavení jídelny
          </button>
          <button className="nav-item" onClick={() => setModal("help")}>
            <CircleHelp size={18} />
            Jak to funguje
          </button>
          <div className="user">
            <span className="avatar">VJ</span>
            <div>
              <strong>Vedoucí jídelny</strong>
              <small>Máte poslední slovo</small>
            </div>
            <ShieldCheck size={17} />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div>
            Pracovní prostor <ChevronRight size={14} />
            <strong>{title}</strong>
          </div>
          <span className="local-status">
            <span />
            {ready
              ? storageError
                ? "Ukládání není dostupné"
                : "Uloženo v tomto prohlížeči"
              : "Načítání…"}
          </span>
        </header>
        <main>
          {storageError && (
            <div className="warning" role="alert">
              {storageError}
            </div>
          )}
          <div className="page-heading">
            <div>
              <div className="eyebrow">S CHUTÍ DO NOVÉHO TÝDNE</div>
              <h1>
                {title}
                <span className="heading-dot">.</span>
              </h1>
              <p>
                {view === "plan"
                  ? "Pestrý týden pro děti. Méně starostí pro vás."
                  : view === "ideas"
                    ? "Malé nápady, které mohou zpestřit velkou kuchyni."
                    : view === "recipes"
                      ? "Jednoduchá jídla pro společné obědy. Všechny gramáže jsou odhady."
                      : view === "basket"
                        ? "Suroviny v plánovaném týdnu, přehledně podle skupin."
                        : "Provozní údaje pro vaše pracovní návrhy."}
              </p>
            </div>
            <Button
              onClick={() => {
                setIdeaText("");
                setAuthor("");
                setModal("idea");
              }}
              variant="secondary"
            >
              <Plus size={17} />
              Přidat nápad
            </Button>
          </div>
          {view === "plan" && (
            <>
              <div className="week-toolbar">
                <div className="week-select">
                  <button
                    aria-label="Předchozí týden"
                    onClick={() => setOffset((o) => o - 1)}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <CalendarDays size={18} />
                  <strong>
                    {dates[0].getDate()}.{" "}
                    {dates[0].getMonth() !== dates[4].getMonth()
                      ? `${dates[0].getMonth() + 1}.`
                      : ""}{" "}
                    – {dates[4].getDate()}. {dates[4].getMonth() + 1}.{" "}
                    {dates[4].getFullYear()}
                  </strong>
                  <button
                    aria-label="Další týden"
                    onClick={() => setOffset((o) => o + 1)}
                  >
                    <ChevronRight size={18} />
                  </button>
                  <span
                    className={`pill ${plan.approved ? "green" : "neutral"}`}
                  >
                    <span className="tiny-dot" />
                    {plan.approved ? "Odsouhlaseno" : "Pracovní návrh"}
                  </span>
                </div>
                <div className="toolbar-actions">
                  <Button variant="ghost" onClick={() => setView("settings")}>
                    <Users size={16} />
                    {data.portions} porcí
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setModal("export")}
                  >
                    <ArrowDownToLine size={16} />
                    Exportovat
                  </Button>
                </div>
              </div>
              <div className="inspiration-banner">
                <div className="sparkle-box">
                  <Sparkles size={23} />
                </div>
                <div>
                  <h3>Jídelníček, na kterém se podílíme společně.</h3>
                  <p>
                    Zapojte nápad rodičů. Zbytek týdne doplníme tak, aby byl
                    pestrý.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setActiveIdea(pending[0]?.id ?? "");
                    setModal("generate");
                  }}
                >
                  <Sparkles size={16} />
                  Navrhnout týden
                  <ArrowRight size={16} />
                </Button>
                <div className="banner-decoration">
                  <Wheat size={84} strokeWidth={0.8} />
                </div>
              </div>
              <div className="section-heading">
                <h2>
                  Co se bude vařit <span>5 obědů · polévka a hlavní jídlo</span>
                </h2>
                <span className="subtle">
                  <span className="tiny-dot green-dot" /> Návrh máte ve svých
                  rukou
                </span>
              </div>
              <div className="meal-grid">
                {meals.map((r, n) => {
                  const linked = data.ideas.some(
                    (i) =>
                      i.status === "included" &&
                      i.week === key &&
                      i.recipeId === r.id,
                  );
                  return (
                    <article
                      className={`meal-card ${linked ? "parent-meal" : ""}`}
                      key={n}
                    >
                      <div className="day-heading">
                        <strong>{days[n]}</strong>
                        <span>
                          {dates[n].getDate()}. {dates[n].getMonth() + 1}.
                        </span>
                      </div>
                      <div className={`meal-illustration ${r.color}`}>
                        <span className="plate">
                          <span>
                            {r.id === "fish"
                              ? "🐟"
                              : r.id === "pasta"
                                ? "🍝"
                                : r.id === "lentil"
                                  ? "🥘"
                                  : r.id === "beef"
                                    ? "🍲"
                                    : r.id === "sweet"
                                      ? "🍎"
                                      : r.id === "risotto"
                                        ? "🥗"
                                        : "🍛"}
                          </span>
                        </span>
                        <span className="illustration-leaf">
                          <Leaf size={24} />
                        </span>
                      </div>
                      <div className="meal-body">
                        <span className={`category ${r.color}`}>
                          {r.category}
                        </span>
                        <h3>{r.name}</h3>
                        <p className="side-dish">{r.side}</p>
                        <div className="soup">
                          <CookingPot size={14} />
                          <span>{r.soup}</span>
                        </div>
                        {linked && (
                          <span className="parent-label">
                            <Lightbulb size={12} />
                            Nápad od rodičů
                          </span>
                        )}
                        <div className="meal-bottom">
                          <span>
                            ≈ {money(cost(r))} Kč <small>/ porce</small>
                          </span>
                          <button
                            aria-label={`Upravit ${days[n]}`}
                            onClick={() => {
                              setEditingDay(n);
                              setSelectedRecipe(r.id);
                            }}
                          >
                            <SlidersHorizontal size={15} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="under-menu">
                <span>
                  <CircleHelp size={14} />
                  Gramáže a ceny jsou orientační.
                </span>
                <button onClick={() => setView("recipes")}>
                  Prohlédnout receptury <ArrowRight size={14} />
                </button>
              </div>
              <div className="dashboard-bottom">
                <section className="panel basket-panel">
                  <div className="section-heading">
                    <h2>
                      <span className="section-icon">
                        <ClipboardList size={18} />
                      </span>
                      Týden v rovnováze
                    </h2>
                    <span className="pill cream">Orientační přehled</span>
                  </div>
                  <p className="panel-description">
                    Průměr surovin na porci a den z navržených receptur.
                  </p>
                  <div className="basket-mini">
                    {totals.slice(0, 5).map((t, n) => (
                      <div className="basket-row" key={t.group}>
                        <span>{t.group}</span>
                        <div className="bar-track">
                          <span
                            style={{
                              width: `${Math.min(100, t.grams / 10)}%`,
                              background: [
                                "#709578",
                                "#dfa660",
                                "#a2ae78",
                                "#bfa086",
                                "#86a7b5",
                              ][n],
                            }}
                          />
                        </div>
                        <strong>{money(t.grams / 5)} g</strong>
                      </div>
                    ))}
                  </div>
                  <div className="basket-foot">
                    <span>
                      <CircleHelp size={15} />
                      Koš se vyhodnocuje za celý měsíc.
                    </span>
                    <button onClick={() => setView("basket")}>
                      Detail koše <ArrowRight size={14} />
                    </button>
                  </div>
                </section>
                <section className="panel ideas-panel">
                  <div className="section-heading">
                    <h2>
                      <span className="section-icon amber">
                        <Lightbulb size={19} />
                      </span>
                      Od rodičů na váš stůl
                    </h2>
                    <span className="pill neutral">{pending.length} nové</span>
                  </div>
                  <p className="panel-description">
                    Inspirace, která čeká na vaše rozhodnutí.
                  </p>
                  {pending.slice(0, 2).map((idea, n) => (
                    <button
                      className="idea-preview"
                      key={idea.id}
                      onClick={() => {
                        setActiveIdea(idea.id);
                        setModal("generate");
                      }}
                    >
                      <span className={`idea-avatar ${n === 1 ? "sage" : ""}`}>
                        {n === 0 ? <Wheat size={19} /> : <Sprout size={19} />}
                      </span>
                      <span>
                        <strong>{idea.text}</strong>
                        <small>{idea.author}</small>
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                  {!pending.length && (
                    <div className="empty-inline">
                      <CheckCheck size={25} />
                      Všechny nápady jsou zpracované.
                    </div>
                  )}
                  <button
                    className="text-link"
                    onClick={() => setView("ideas")}
                  >
                    Všechny nápady <ArrowRight size={15} />
                  </button>
                </section>
              </div>
              <div className="approval-bar">
                <div>
                  <ShieldCheck size={20} />
                  <span>
                    <strong>
                      {plan.approved
                        ? "Pracovní návrh jste odsouhlasili."
                        : "Poslední slovo máte vždy vy."}
                    </strong>
                    <small>
                      {plan.approved
                        ? "Nic se automaticky neposílá rodičům ani nepublikuje."
                        : "Zkontrolujte receptury, gramáže a možnosti vaší kuchyně."}
                    </small>
                  </span>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    savePlan({ ...plan, approved: !plan.approved });
                    setNotice(
                      plan.approved
                        ? "Jídelníček je znovu otevřený k úpravám."
                        : "Pracovní návrh odsouhlasen. Ověření koše a alergenů zůstává na jídelně.",
                    );
                  }}
                >
                  <Check size={16} />
                  {plan.approved ? "Znovu otevřít návrh" : "Odsouhlasit návrh"}
                </Button>
              </div>
            </>
          )}
          {view === "ideas" && (
            <div className="idea-list">
              {data.ideas.map((idea) => (
                <article className="panel idea-full" key={idea.id}>
                  <div className="section-heading">
                    <span className="subtle">{idea.author}</span>
                    <span
                      className={`pill ${idea.status === "included" ? "green" : "neutral"}`}
                    >
                      {idea.status === "new"
                        ? "Nový nápad"
                        : idea.status === "included"
                          ? "V návrhu jídelníčku"
                          : "Nezařazeno"}
                    </span>
                  </div>
                  <h2>„{idea.text}“</h2>
                  <div className="response">
                    <Lightbulb size={18} />
                    <div>
                      <strong>{recipe(idea.recipeId).name}</strong>
                      <p>{idea.explanation}</p>
                      {idea.week && (
                        <small>
                          Týden od{" "}
                          {new Date(idea.week + "T12:00:00").toLocaleDateString(
                            "cs-CZ",
                          )}{" "}
                          · pracovní návrh
                        </small>
                      )}
                      {idea.reason && (
                        <p>
                          Důvod nezařazení: {idea.reason}. Alternativa:{" "}
                          {recipe(idea.recipeId).name} v jiném týdnu po dohodě s
                          jídelnou.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="button-row">
                    <Button
                      onClick={() => {
                        setActiveIdea(idea.id);
                        setModal("generate");
                      }}
                    >
                      Zapracovat do týdne
                      <ArrowRight size={16} />
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            `${idea.status === "included" ? "Nápad jsme zahrnuli do pracovního návrhu. " : ""}${idea.explanation}${idea.reason ? ` Důvod nezařazení: ${idea.reason}. Alternativou je ${recipe(idea.recipeId).name} v jiném týdnu po dohodě s jídelnou.` : ""}`,
                          );
                          setNotice("Vysvětlení pro rodiče bylo zkopírováno.");
                        } catch {
                          setNotice(
                            "Kopírování není dostupné. Označte a zkopírujte vysvětlení ručně.",
                          );
                        }
                      }}
                    >
                      Kopírovat vysvětlení
                    </Button>
                    {idea.status !== "declined" && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setRejection(idea.id);
                          setReason("");
                        }}
                      >
                        Nezařadit
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
          {view === "recipes" && (
            <>
              <div className="catalog-toolbar">
                <input
                  aria-label="Hledat recepturu"
                  placeholder="Hledat jídlo nebo surovinu…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span>{RECIPES.length} startovních receptur</span>
              </div>
              <div className="recipe-grid">
                {RECIPES.filter((r) =>
                  `${r.name} ${r.ingredients.map((i) => i.name).join(" ")}`
                    .toLocaleLowerCase("cs")
                    .includes(search.toLocaleLowerCase("cs")),
                ).map((r) => (
                  <button
                    className="panel recipe-tile"
                    key={r.id}
                    onClick={() => {
                      setEditingDay(null);
                      setSelectedRecipe(r.id);
                    }}
                  >
                    <span className={`category ${r.color}`}>{r.category}</span>
                    <h2>{r.name}</h2>
                    <p>{r.side}</p>
                    <div>
                      <span>≈ {money(cost(r))} Kč / porce</span>
                      <ArrowRight size={18} />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
          {view === "basket" && (
            <section className="panel">
              <div className="section-heading">
                <h2>Suroviny za vybraný týden</h2>
                <span className="pill cream">
                  Odhad · {data.portions} porcí denně
                </span>
              </div>
              <p className="panel-description">
                Týden od {dates[0].toLocaleDateString("cs-CZ")}. Hmotnosti v
                nákupním stavu bez normativních přepočtů.
              </p>
              <div className="warning">
                Chybí ověřené receptury, měsíční data a normy pro věkovou
                skupinu. Tento přehled nepotvrzuje splnění spotřebního koše ani
                vyhlášky.
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Skupina surovin</th>
                    <th>Na porci / týden</th>
                    <th>Průměr / den</th>
                    <th>Celkem na týden</th>
                  </tr>
                </thead>
                <tbody>
                  {totals.map((t) => (
                    <tr key={t.group}>
                      <td>{t.group}</td>
                      <td>{money(t.grams)} g</td>
                      <td>{money(t.grams / 5)} g</td>
                      <td>{money((t.grams * data.portions) / 1000)} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="cost-summary">
                <strong>Odhad nákladů: {money(average)} Kč / porce</strong>
                <span
                  className={`pill ${average <= data.limit ? "green" : "cream"}`}
                >
                  {average <= data.limit
                    ? "V nastaveném rozpočtu"
                    : "Nad nastaveným rozpočtem"}{" "}
                  · limit {data.limit} Kč
                </span>
              </div>
              <p className="fine-print">
                Ceny jsou pracovní odhady surovin, bez práce, energií a režie.{" "}
                {plan.rules}. Alergeny nejsou ověřené.
              </p>
            </section>
          )}
          {view === "settings" && (
            <section className="panel settings-panel">
              <h2>Vaše kuchyně</h2>
              <p className="panel-description">
                Údaje se používají pro přepočet surovin a orientačního rozpočtu.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  setData((d) => ({
                    ...d,
                    portions: Number(form.get("portions")),
                    limit: Number(form.get("limit")),
                  }));
                  setNotice("Nastavení jídelny bylo uloženo.");
                }}
              >
                <label>
                  Počet porcí denně
                  <input
                    name="portions"
                    type="number"
                    min="1"
                    max="2000"
                    required
                    defaultValue={data.portions}
                  />
                </label>
                <label>
                  Vlastní rozpočet na suroviny (Kč / porce)
                  <input
                    name="limit"
                    type="number"
                    min="1"
                    max="200"
                    step="0.5"
                    required
                    defaultValue={data.limit}
                  />
                </label>
                <div className="warning">
                  Startovní katalog používá jednu modelovou porci. Věkové
                  kategorie, diety a vybavení kuchyně zatím nejsou zohledněny.
                </div>
                <Button type="submit">
                  Uložit nastavení
                  <Check size={16} />
                </Button>
              </form>
              <hr />
              <h3>Data zůstávají u vás</h3>
              <p className="panel-description">
                Nápady a plány jsou uložené pouze v tomto prohlížeči. Nejsou
                sdílené s rodiči ani dalšími zařízeními.
              </p>
            </section>
          )}
          <footer className="page-footer">
            <span>
              <Sprout size={15} /> Společný stůl <span>·</span> S péčí o každou
              porci
            </span>
            <span>Váš pomocník, vaše rozhodnutí.</span>
          </footer>
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <CheckCheck size={18} />
          {notice}
          <button aria-label="Zavřít oznámení" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {(modal || selectedRecipe || rejection) && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setModal(null);
              setSelectedRecipe(null);
              setRejection(null);
            }
          }}
        >
          <section
            className="modal"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={
              selectedRecipe
                ? "Receptura"
                : rejection
                  ? "Nezařazení nápadu"
                  : "Plánování jídelníčku"
            }
          >
            <button
              className="modal-close"
              aria-label="Zavřít dialog"
              onClick={() => {
                setModal(null);
                setSelectedRecipe(null);
                setRejection(null);
              }}
            >
              <X size={21} />
            </button>
            {modal === "idea" && (
              <>
                <span className="modal-symbol">
                  <Lightbulb />
                </span>
                <h2>Každý nápad se počítá.</h2>
                <p>
                  Co dětem chutná? Stačí jedna věta. Vybereme blízkou variantu
                  ze startovního katalogu.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!ideaText.trim()) return;
                    const proposal = propose(ideaText);
                    setData((d) => ({
                      ...d,
                      ideas: [
                        {
                          id: crypto.randomUUID(),
                          text: ideaText.trim(),
                          author: author.trim() || "Rodič · bez uvedení třídy",
                          ...proposal,
                          status: "new",
                        },
                        ...d.ideas,
                      ],
                    }));
                    setModal(null);
                    setView("ideas");
                    setNotice("Nápad je uložený a návrh připravený.");
                  }}
                >
                  <label>
                    Váš nápad
                    <textarea
                      autoFocus
                      required
                      maxLength={1000}
                      placeholder="Třeba: Naše děti milují špagety…"
                      value={ideaText}
                      onChange={(e) => setIdeaText(e.target.value)}
                    />
                  </label>
                  <label>
                    Od koho / třída <span className="subtle">(nepovinné)</span>
                    <input
                      maxLength={80}
                      placeholder="Rodič · 4. A"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                    />
                  </label>
                  <Button type="submit">
                    <Sparkles size={16} />
                    Připravit návrh
                  </Button>
                </form>
              </>
            )}
            {modal === "generate" && (
              <>
                <span className="modal-symbol">
                  <Sparkles />
                </span>
                <h2>Dejme nápadu místo u stolu.</h2>
                <p>
                  Vyberte inspiraci pro týden od{" "}
                  {dates[0].toLocaleDateString("cs-CZ")}. Doplníme pět různých
                  jídel z katalogu.
                </p>
                <label>
                  Nápad od rodičů
                  <select
                    autoFocus
                    value={activeIdea}
                    onChange={(e) => setActiveIdea(e.target.value)}
                  >
                    <option value="">Bez nápadu · pestrý základ</option>
                    {data.ideas
                      .filter((i) => i.status !== "declined")
                      .map((i) => (
                        <option value={i.id} key={i.id}>
                          {i.text}
                        </option>
                      ))}
                  </select>
                </label>
                {activeIdea && (
                  <div className="response">
                    <Lightbulb size={22} />
                    <p>
                      {data.ideas.find((i) => i.id === activeIdea)?.explanation}
                    </p>
                  </div>
                )}
                <div className="warning">
                  Nahradí aktuální pracovní týden. Výsledek vyžaduje kontrolu
                  gramáží, rozpočtu, alergenů a měsíčního koše.
                </div>
                <Button onClick={() => generate(activeIdea)}>
                  <RefreshCw size={16} />
                  Vytvořit pracovní návrh
                </Button>
              </>
            )}
            {modal === "export" && (
              <>
                <span className="modal-symbol">
                  <ArrowDownToLine />
                </span>
                <h2>Jídelníček s sebou</h2>
                <p>
                  Textový soubor obsahuje pět obědů, suroviny na porci i na{" "}
                  {data.portions} porcí, odhad cen a vysvětlení zapracovaných
                  nápadů.
                </p>
                <div className="response">
                  <ShieldCheck size={20} />
                  <p>
                    Export je podklad k ruční kontrole. Nikam se automaticky
                    nepublikuje.
                  </p>
                </div>
                <Button onClick={exportPlan}>
                  <ArrowDownToLine size={16} />
                  Stáhnout jídelníček (.txt)
                </Button>
              </>
            )}
            {modal === "help" && (
              <>
                <span className="modal-symbol">
                  <Sprout />
                </span>
                <h2>Od nápadu ke společnému obědu.</h2>
                <ol className="help-steps">
                  <li>
                    Přidejte větu od rodiče. Nástroj vybere variantu z malého
                    katalogu pomocí klíčových slov.
                  </li>
                  <li>
                    Navrhněte týden. Nápad doplníme dalšími různými jídly.
                  </li>
                  <li>
                    Prohlédněte suroviny a odhady. U každého dne můžete vyměnit
                    recepturu.
                  </li>
                  <li>
                    Odsouhlaste pracovní návrh a zkopírujte rodiči vysvětlení.
                  </li>
                </ol>
                <div className="warning">
                  Tato verze neprovádí měsíční optimalizaci ani právní kontrolu.
                  Neznámý nápad nabídne k ručnímu posouzení s alternativou.{" "}
                  {RULE_VERSION}.
                </div>
              </>
            )}
            {selectedRecipe &&
              (() => {
                const r = recipe(selectedRecipe);
                return (
                  <>
                    <span className={`category ${r.color}`}>{r.category}</span>
                    <h2>{r.name}</h2>
                    <p>
                      {r.side}
                      <br />
                      Polévka: {r.soup}
                    </p>
                    {editingDay !== null && (
                      <label>
                        Jídlo pro {days[editingDay].toLowerCase()}
                        <select
                          value={selectedRecipe}
                          onChange={(e) => setSelectedRecipe(e.target.value)}
                        >
                          {RECIPES.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    <div className="section-heading">
                      <h3>Suroviny včetně polévky</h3>
                      <span className="pill cream">Odhad</span>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Surovina</th>
                          <th>1 porce</th>
                          <th>{data.portions} porcí</th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.ingredients.map((i) => (
                          <tr key={i.name}>
                            <td>{i.name}</td>
                            <td>{i.grams} g</td>
                            <td>
                              {money((i.grams * data.portions) / 1000)} kg
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="fine-print">
                      ≈ {money(cost(r))} Kč / porce · Hmotnosti před přípravou.
                      Sůl, koření a voda nejsou započteny. Alergeny nejsou
                      ověřené.
                    </p>
                    {editingDay !== null && (
                      <Button
                        onClick={() => {
                          const next = [...plan.meals];
                          next[editingDay] = selectedRecipe;
                          savePlan({ ...plan, meals: next, approved: false });
                          setSelectedRecipe(null);
                          setEditingDay(null);
                          setNotice(
                            "Jídlo upraveno. Návrh čeká na nové odsouhlasení.",
                          );
                        }}
                      >
                        Uložit změnu
                        <Check size={16} />
                      </Button>
                    )}
                  </>
                );
              })()}
            {rejection && (
              <>
                <h2>Někdy to teď nevyjde.</h2>
                <p>Rodiči vždy patří důvod a další možnost.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!reason.trim()) return;
                    setData((d) => ({
                      ...d,
                      ideas: d.ideas.map((i) =>
                        i.id === rejection
                          ? {
                              ...i,
                              status: "declined",
                              reason: reason.trim(),
                              week: undefined,
                            }
                          : i,
                      ),
                    }));
                    setRejection(null);
                    setNotice("Důvod i alternativa jsou uložené u nápadu.");
                  }}
                >
                  <label>
                    Proč nápad nezařadíte?
                    <textarea
                      autoFocus
                      required
                      maxLength={600}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Například: Tento týden nemáme kapacitu na ruční přípravu."
                    />
                  </label>
                  <div className="response">
                    Alternativa:{" "}
                    {
                      recipe(
                        data.ideas.find((i) => i.id === rejection)?.recipeId ??
                          "risotto",
                      ).name
                    }{" "}
                    v jiném týdnu po dohodě s jídelnou.
                  </div>
                  <Button type="submit">Uložit vysvětlení</Button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
