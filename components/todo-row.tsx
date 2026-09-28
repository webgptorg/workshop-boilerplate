"use client";

import Link from "next/link";
import { CalendarDays, Check, ChevronRight, Flag } from "lucide-react";
import type { Todo } from "@/lib/types";
import { dateLabel, dayKey } from "@/lib/utils";
import { toggleTodo } from "@/lib/store";
import { useMinute } from "./minute-provider";
import { EntityChip } from "./entity-chip";

export function TodoRow({ todo, compact = false, depth = 0 }: { todo: Todo; compact?: boolean; depth?: number }) {
  const { state, t } = useMinute();
  const children = state.todos.filter((item) => item.parentId === todo.id);
  const dueToday = todo.dueDate === dayKey();
  const overdue = !!todo.dueDate && todo.dueDate < dayKey() && !todo.completed;
  return (
    <div
      className={`todo-row ${todo.completed ? "is-complete" : ""} ${compact ? "todo-compact" : ""}`}
      style={{ paddingLeft: `${22 + depth * 24}px` }}
    >
      <button
        className="todo-checkbox"
        role="checkbox"
        aria-checked={todo.completed}
        aria-label={`${todo.completed ? t("Mark pending", "Označit jako nesplněný") : t("Complete", "Dokončit")}: ${todo.title}`}
        onClick={() => toggleTodo(todo.id)}
      >
        {todo.completed && <Check size={13} strokeWidth={3} />}
      </button>
      <div className="todo-main">
        <Link className="todo-title" href={`/${todo.workspaceId}/todos/${todo.id}`}>
          {todo.title}
        </Link>
        <div className="todo-context">
          {todo.meetingIds.length > 0 ? (
            <EntityChip type="meeting" id={todo.meetingIds[0]} compact />
          ) : (
            <span className="manual-todo">
              {todo.id.startsWith("tutorial") ? t("Getting started", "První kroky") : t("Personal todo", "Osobní úkol")}
            </span>
          )}
          {children.length > 0 && (
            <span className="subtodo-count">
              {children.filter((item) => item.completed).length}/{children.length} {t("subtodos", "podúkolů")}
            </span>
          )}
        </div>
      </div>
      {todo.dueDate && (
        <span className={`due-label ${dueToday && !todo.completed ? "due-today" : ""} ${overdue ? "overdue" : ""}`}>
          <CalendarDays size={12} />
          {dateLabel(todo.dueDate, state.user.language)}
        </span>
      )}
      <span
        className={`priority-indicator priority-${todo.priority}`}
        title={
          todo.priority === "high"
            ? t("High priority", "Vysoká priorita")
            : todo.priority === "medium"
              ? t("Medium priority", "Střední priorita")
              : t("Low priority", "Nízká priorita")
        }
      >
        <Flag size={14} />
      </span>
      {!compact && (
        <Link className="todo-open" href={`/${todo.workspaceId}/todos/${todo.id}`} aria-label={t("Open todo", "Otevřít úkol")}>
          <ChevronRight size={17} />
        </Link>
      )}
    </div>
  );
}
