"use client";

import { useState } from "react";
import { ArrowDownWideNarrow, Plus, Search } from "lucide-react";
import { useMinute } from "./minute-provider";
import { TodoRow } from "./todo-row";
import { EmptyState, PageHeading } from "./shared";
import { Button } from "./ui/button";
import type { Todo } from "@/lib/types";

export function TodosView({ workspaceId, onNewTodo }: { workspaceId: string; onNewTodo: () => void }) {
  const { state, t } = useMinute();
  const [filter, setFilter] = useState("pending");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("date");
  const todos = state.todos.filter((item) => item.workspaceId === workspaceId);
  const done = todos.filter((item) => item.completed).length;
  const filtered = todos
    .filter(
      (item) =>
        (filter === "all" || (filter === "completed" ? item.completed : !item.completed)) &&
        `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "priority"
        ? { high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]
        : (a.dueDate || "9999").localeCompare(b.dueDate || "9999"),
    );
  const visibleIds = new Set(filtered.map((todo) => todo.id));
  function renderTree(todo: Todo, depth = 0): React.ReactNode {
    if (depth > 20) return null;
    return (
      <div key={todo.id}>
        <TodoRow todo={todo} depth={depth} />
        {filtered.filter((item) => item.parentId === todo.id).map((child) => renderTree(child, depth + 1))}
      </div>
    );
  }
  return (
    <>
      <PageHeading
        eyebrow={t("SMALL STEPS, REAL PROGRESS", "MALÉ KROKY, SKUTEČNÝ POKROK")}
        title={t("Todos", "Úkoly")}
        subtitle={t("Keep the momentum going, one next step at a time.", "Udržujte tempo, jeden další krok za druhým.")}
      >
        <Button onClick={onNewTodo}>
          <Plus size={17} />
          {t("New todo", "Nový úkol")}
        </Button>
      </PageHeading>
      <div className="todo-progress-card">
        <div>
          <span className="eyebrow">{t("YOUR WORKSPACE, MOVING FORWARD", "VÁŠ PROSTOR SE POSOUVÁ VPŘED")}</span>
          <h3>
            {done}{" "}
            <span>
              {t("of", "z")} {todos.length} {t("todos complete", "úkolů dokončeno")}
            </span>
          </h3>
        </div>
        <div className="progress-track">
          <i style={{ width: `${todos.length ? (done / todos.length) * 100 : 0}%` }} />
        </div>
        <strong>{todos.length ? Math.round((done / todos.length) * 100) : 0}%</strong>
      </div>
      <div className="view-toolbar">
        <div className="filter-tabs">
          {[
            { id: "pending", title: t("Open", "Otevřené"), count: todos.length - done },
            { id: "completed", title: t("Completed", "Dokončené"), count: done },
            { id: "all", title: t("All todos", "Všechny úkoly"), count: todos.length },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setFilter(tab.id)} className={filter === tab.id ? "active" : ""}>
              {tab.title}
              <span>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="list-tools">
        <div className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Find a todo…", "Najít úkol…")}
            aria-label={t("Search todos", "Hledat úkoly")}
          />
        </div>
        <label className="sort-select">
          <ArrowDownWideNarrow size={15} />
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label={t("Sort todos", "Řazení úkolů")}>
            <option value="date">{t("Due date", "Termín")}</option>
            <option value="priority">{t("Priority", "Priorita")}</option>
          </select>
        </label>
      </div>
      <div className="todo-panel">
        {filtered.length ? (
          filtered.filter((todo) => !todo.parentId || !visibleIds.has(todo.parentId)).map((todo) => renderTree(todo))
        ) : (
          <EmptyState
            type="todo"
            title={
              query ? t("Nothing matches just yet", "Zatím žádná shoda") : t("A little breathing room", "Trocha prostoru k nadechnutí")
            }
            description={
              query
                ? t("Try a different search.", "Zkuste jiné hledání.")
                : t(
                    "No todos in this view. Add your next step when you’re ready.",
                    "V tomto zobrazení nejsou žádné úkoly. Přidejte další krok, až budete připraveni.",
                  )
            }
          />
        )}
        <button className="add-todo-row" onClick={onNewTodo}>
          <Plus size={17} />
          {t("Add a todo", "Přidat úkol")}
        </button>
      </div>
    </>
  );
}
