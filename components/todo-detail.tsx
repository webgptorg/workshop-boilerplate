"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Check, Circle, Flag, Link2, Pencil, Plus, Trash2 } from "lucide-react";
import { useMinute } from "./minute-provider";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";
import { TodoDialog } from "./forms/todo-dialog";
import { EntityChip, Markdown } from "./entity-chip";
import { SectionHeading } from "./shared";
import { TodoRow } from "./todo-row";
import { removeTodo, toggleTodo } from "@/lib/store";
import { dateLabel } from "@/lib/utils";
import type { Todo } from "@/lib/types";

export function TodoDetail({ todo }: { todo: Todo }) {
  const { state, t, notify } = useMinute();
  const router = useRouter();
  const [dialog, setDialog] = useState<"edit" | "child" | "delete" | null>(null);
  const children = state.todos.filter((item) => item.parentId === todo.id);
  return (
    <>
      <Link href={`/${todo.workspaceId}/todos`} className="back-link">
        <ArrowLeft size={16} />
        {t("Back to todos", "Zpět na úkoly")}
      </Link>
      <div className="detail-heading">
        <div className="eyebrow">{t("ONE NEXT STEP", "JEDEN DALŠÍ KROK")}</div>
        <h1 className={todo.completed ? "completed-title" : ""}>{todo.title}</h1>
        <div className="detail-actions">
          <Button onClick={() => toggleTodo(todo.id)} variant={todo.completed ? "secondary" : "primary"}>
            {todo.completed ? <Circle size={16} /> : <Check size={16} />}
            {todo.completed ? t("Mark as open", "Označit jako otevřený") : t("Mark complete", "Dokončit úkol")}
          </Button>
          <Button variant="secondary" onClick={() => setDialog("edit")}>
            <Pencil size={15} />
            {t("Edit", "Upravit")}
          </Button>
          <button
            className="icon-button"
            title={t("Copy link", "Kopírovat odkaz")}
            aria-label={t("Copy todo link", "Kopírovat odkaz na úkol")}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                notify(t("Todo link copied", "Odkaz na úkol zkopírován"));
              } catch {
                notify(t("Copy the URL from your address bar.", "Zkopírujte URL z adresního řádku."));
              }
            }}
          >
            <Link2 size={18} />
          </button>
          <button className="icon-button danger" aria-label={t("Delete todo", "Smazat úkol")} onClick={() => setDialog("delete")}>
            <Trash2 size={17} />
          </button>
        </div>
      </div>
      <div className="detail-grid">
        <section className="detail-card">
          <h2>{t("The details", "Podrobnosti")}</h2>
          {todo.description ? (
            <Markdown>{todo.description}</Markdown>
          ) : (
            <p className="muted">
              {t("No description yet. Add a little context with Edit.", "Zatím bez popisu. Přidejte kontext tlačítkem Upravit.")}
            </p>
          )}
          <SectionHeading title={t("Subtodos", "Podúkoly")} count={children.length}>
            <button className="text-link" onClick={() => setDialog("child")}>
              <Plus size={15} />
              {t("Add", "Přidat")}
            </button>
          </SectionHeading>
          <div className="subtodo-list">
            {children.length ? (
              children.map((child) => <TodoRow todo={child} key={child.id} compact />)
            ) : (
              <button className="add-todo-row" onClick={() => setDialog("child")}>
                <Plus size={16} />
                {t("Break it into smaller steps", "Rozdělit na menší kroky")}
              </button>
            )}
          </div>
        </section>
        <aside className="detail-card properties-card">
          <h2>{t("At a glance", "Na první pohled")}</h2>
          <div className="property">
            <span>
              <Check size={16} />
              {t("Status", "Stav")}
            </span>
            <strong>{todo.completed ? t("Completed", "Dokončeno") : t("Open", "Otevřeno")}</strong>
          </div>
          <div className="property">
            <span>
              <CalendarDays size={16} />
              {t("Due date", "Termín")}
            </span>
            <strong>{todo.dueDate ? dateLabel(todo.dueDate, state.user.language) : t("No due date", "Bez termínu")}</strong>
          </div>
          <div className="property">
            <span>
              <Flag size={16} />
              {t("Priority", "Priorita")}
            </span>
            <strong className={`priority-${todo.priority}`}>
              {todo.priority === "high" ? t("High", "Vysoká") : todo.priority === "medium" ? t("Medium", "Střední") : t("Low", "Nízká")}
            </strong>
          </div>
          <div className="property-block">
            <span>{t("Workspace", "Pracovní prostor")}</span>
            <EntityChip type="workspace" id={todo.workspaceId} />
          </div>
          {todo.parentId && (
            <div className="property-block">
              <span>{t("Parent todo", "Nadřazený úkol")}</span>
              <EntityChip type="todo" id={todo.parentId} />
            </div>
          )}
          <div className="property-block">
            <span>{t("From these conversations", "Z těchto rozhovorů")}</span>
            {todo.meetingIds.length ? (
              todo.meetingIds.map((id) => <EntityChip type="meeting" id={id} key={id} />)
            ) : (
              <span className="muted small-text">{t("No linked meetings", "Žádné propojené schůzky")}</span>
            )}
          </div>
        </aside>
      </div>
      {(dialog === "edit" || dialog === "child") && (
        <TodoDialog
          workspaceId={todo.workspaceId}
          todo={dialog === "edit" ? todo : undefined}
          parentId={dialog === "child" ? todo.id : undefined}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "delete" && (
        <Modal
          title={t("Delete this todo?", "Smazat tento úkol?")}
          subtitle={t("Subtodos will stay in your workspace as standalone todos.", "Podúkoly zůstanou v prostoru jako samostatné úkoly.")}
          onClose={() => setDialog(null)}
        >
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setDialog(null)}>
              {t("Cancel", "Zrušit")}
            </Button>
            <Button
              className="button-danger"
              onClick={() => {
                removeTodo(todo.id);
                router.push(`/${todo.workspaceId}/todos`);
                notify(t("Todo deleted", "Úkol smazán"));
              }}
            >
              {t("Delete todo", "Smazat úkol")}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
