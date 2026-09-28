"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { useMinute } from "../minute-provider";
import { mutate } from "@/lib/store";
import { uid } from "@/lib/utils";
import type { Priority, Todo } from "@/lib/types";

export function TodoDialog({
  workspaceId,
  onClose,
  todo,
  parentId,
  meetingId,
}: {
  workspaceId: string;
  onClose: () => void;
  todo?: Todo;
  parentId?: string;
  meetingId?: string;
}) {
  const { t, state, notify } = useMinute();
  const [meetingIds, setMeetingIds] = useState(todo?.meetingIds ?? (meetingId ? [meetingId] : []));
  const meetings = state.meetings.filter((item) => item.workspaceId === workspaceId);
  const excluded = new Set([todo?.id]);
  let changed = true;
  while (changed) {
    changed = false;
    state.todos.forEach((item) => {
      if (item.parentId && excluded.has(item.parentId) && !excluded.has(item.id)) {
        excluded.add(item.id);
        changed = true;
      }
    });
  }
  const parents = state.todos.filter((item) => item.workspaceId === workspaceId && !excluded.has(item.id));
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title")).trim();
    if (!title) return;
    const next: Todo = {
      id: todo?.id ?? uid(),
      workspaceId,
      title,
      description: String(data.get("description")).trim(),
      dueDate: String(data.get("dueDate")),
      completed: todo?.completed ?? false,
      priority: String(data.get("priority")) as Priority,
      parentId: String(data.get("parentId")) || null,
      meetingIds,
      createdAt: todo?.createdAt ?? new Date().toISOString(),
    };
    mutate((current) => ({
      ...current,
      todos: todo ? current.todos.map((item) => (item.id === todo.id ? next : item)) : [next, ...current.todos],
    }));
    notify(todo ? t("Todo updated", "Úkol upraven") : t("Todo added", "Úkol přidán"));
    onClose();
  }
  return (
    <Modal
      title={
        todo
          ? t("Edit todo", "Upravit úkol")
          : parentId
            ? t("One smaller step.", "Jeden menší krok.")
            : t("What’s the next step?", "Jaký je další krok?")
      }
      subtitle={t("Turn a good conversation into something done.", "Proměňte dobrý rozhovor v hotovou práci.")}
      onClose={onClose}
    >
      <form className="form-stack" onSubmit={submit}>
        <label className="field-label">
          {t("Title", "Název")}
          <input
            name="title"
            required
            autoFocus
            maxLength={200}
            defaultValue={todo?.title}
            placeholder={t("e.g. Share the project proposal", "Např. Sdílet návrh projektu")}
          />
        </label>
        <label className="field-label">
          {t("Description", "Popis")}
          <textarea
            name="description"
            rows={3}
            defaultValue={todo?.description}
            placeholder={t("Add context, notes, or a link. Markdown supported.", "Kontext, poznámky nebo odkaz. Markdown je podporován.")}
          />
        </label>
        <div className="form-grid">
          <label className="field-label">
            {t("Due date", "Termín")}
            <input type="date" name="dueDate" defaultValue={todo?.dueDate} />
          </label>
          <label className="field-label">
            {t("Priority", "Priorita")}
            <select name="priority" defaultValue={todo?.priority ?? "medium"}>
              <option value="low">{t("Low", "Nízká")}</option>
              <option value="medium">{t("Medium", "Střední")}</option>
              <option value="high">{t("High", "Vysoká")}</option>
            </select>
          </label>
        </div>
        <label className="field-label">
          {t("Parent todo", "Nadřazený úkol")}
          <select name="parentId" defaultValue={todo?.parentId ?? parentId ?? ""}>
            <option value="">{t("No parent — standalone todo", "Bez nadřazeného úkolu")}</option>
            {parents.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        {!!meetings.length && (
          <fieldset className="meeting-picker">
            <legend>{t("Linked meetings", "Propojené schůzky")}</legend>
            {meetings.map((meeting) => (
              <label key={meeting.id}>
                <input
                  type="checkbox"
                  checked={meetingIds.includes(meeting.id)}
                  onChange={(event) =>
                    setMeetingIds(event.target.checked ? [...meetingIds, meeting.id] : meetingIds.filter((id) => id !== meeting.id))
                  }
                />
                <span>{meeting.title}</span>
              </label>
            ))}
          </fieldset>
        )}
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>
            {t("Cancel", "Zrušit")}
          </Button>
          <Button type="submit">
            {todo ? <Check size={16} /> : <Plus size={16} />}
            {todo ? t("Save changes", "Uložit změny") : t("Create todo", "Vytvořit úkol")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
