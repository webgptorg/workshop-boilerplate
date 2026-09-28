"use client";
import Link from "next/link";
import { useState } from "react";
import { Button, Card } from "@/components/ui";
import type { ActionItem } from "@/lib/minute/types";
import { shortDate, uid } from "@/lib/minute/utils";
import { useMinute } from "./provider";
import { Avatar, EmptyState, ExportMenu, Modal } from "./shared";
import { Icon } from "./icon";

export function ActionRow({
  action,
  onOpen,
  indent = 0,
}: {
  action: ActionItem;
  onOpen: (id: string) => void;
  indent?: number;
}) {
  const { workspace, updateAction, t, language } = useMinute();
  return (
    <div
      className={`action-row ${action.completed ? "action-completed" : ""}`}
      style={{ paddingLeft: 20 + indent * 25 }}
    >
      <input
        className="task-checkbox"
        type="checkbox"
        checked={action.completed}
        onChange={(e) =>
          updateAction(
            action.id,
            { completed: e.target.checked },
            e.target.checked ? "Marked complete" : "Reopened",
          )
        }
        aria-label={`${t("Complete", "Dokončit")} ${action.title}`}
      />
      <div className="action-row-main">
        <button
          className="action-title-button"
          onClick={() => onOpen(action.id)}
        >
          {action.title}
        </button>
        <div className="action-row-meta">
          {action.callIds.map((id) => (
            <Link key={id} href={`/${workspace?.id}/calls/${id}`}>
              <Icon name="calls" size={12} />
              {workspace?.calls.find((c) => c.id === id)?.title}
            </Link>
          ))}
          {action.relatedIds.length > 0 && (
            <span>
              <Icon name="link" size={12} />
              {action.relatedIds.length} {t("related", "související")}
            </span>
          )}
        </div>
      </div>
      {action.dueDate && (
        <span className="task-due">
          <Icon name="calendar" size={14} />
          {shortDate(action.dueDate, language)}
        </span>
      )}
      <Avatar name={action.assignee} small />
      <button
        className="icon-button"
        onClick={() => onOpen(action.id)}
        aria-label={`Open ${action.title}`}
      >
        <Icon name="chevron" size={16} />
      </button>
    </div>
  );
}
export function Actions({
  onOpen,
  callId,
}: {
  onOpen: (id: string) => void;
  callId?: string;
}) {
  const { workspace, t, addAction } = useMinute();
  const [filter, setFilter] = useState("open");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedCall, setSelectedCall] = useState(callId || "");
  if (!workspace) return null;
  const inScope = workspace.actions.filter(
    (a) => !callId || a.callIds.includes(callId),
  );
  const filtered = inScope.filter(
    (a) =>
      (filter === "all" || (filter === "done" ? a.completed : !a.completed)) &&
      a.title.toLowerCase().includes(query.toLowerCase()),
  );
  const visibleIds = new Set(filtered.map((a) => a.id));
  function renderTree(action: ActionItem, indent = 0): React.ReactNode {
    return (
      <div key={action.id}>
        <ActionRow action={action} onOpen={onOpen} indent={indent} />
        {filtered
          .filter((a) => a.parentId === action.id)
          .map((a) => renderTree(a, Math.min(indent + 1, 5)))}
      </div>
    );
  }
  return (
    <>
      {!callId && (
        <div className="page-heading">
          <div>
            <span className="eyebrow">{workspace.name.toUpperCase()}</span>
            <h1>
              {t(
                "Good ideas, moving forward.",
                "Dobré nápady se posouvají dál.",
              )}
            </h1>
          </div>
          <div className="heading-actions">
            <ExportMenu actionsOnly />
            <Button onClick={() => setCreating(true)}>
              <Icon name="plus" size={17} />
              {t("New action item", "Nový úkol")}
            </Button>
          </div>
        </div>
      )}
      <div className="collection-toolbar">
        <div className="filter-tabs">
          {[
            [
              "open",
              t("To do", "K dokončení"),
              inScope.filter((a) => !a.completed).length,
            ],
            [
              "done",
              t("Completed", "Dokončené"),
              inScope.filter((a) => a.completed).length,
            ],
            ["all", t("All items", "Všechny"), inScope.length],
          ].map(([id, label, count]) => (
            <button
              key={id}
              onClick={() => setFilter(String(id))}
              className={filter === id ? "selected" : ""}
            >
              {label}
              <span className="tab-count">{count}</span>
            </button>
          ))}
        </div>
        <label className="inline-search action-search">
          <Icon name="search" size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Find an action item…", "Hledat úkol…")}
          />
        </label>
        {callId && (
          <Button variant="secondary" onClick={() => setCreating(true)}>
            <Icon name="plus" size={16} />
            {t("Add item", "Přidat úkol")}
          </Button>
        )}
      </div>
      <Card className="actions-list">
        {filtered.length ? (
          filtered
            .filter((a) => !a.parentId || !visibleIds.has(a.parentId))
            .map((a) => renderTree(a))
        ) : (
          <EmptyState
            title={
              filter === "done"
                ? t(
                    "Your completed tasks will be here.",
                    "Tady budou dokončené úkoly.",
                  )
                : t("A clear list. A clear mind.", "Čistý seznam. Čistá hlava.")
            }
            icon="check"
          />
        )}
      </Card>
      {creating && (
        <Modal
          title={t("A new next step", "Nový další krok")}
          onClose={() => setCreating(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (title.trim() && selectedCall) {
                addAction(title.trim(), [selectedCall]);
                setCreating(false);
                setTitle("");
              }
            }}
          >
            <label className="field">
              {t("Action item", "Úkol")}
              <input
                autoFocus
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t(
                  "What needs to happen?",
                  "Co je potřeba udělat?",
                )}
              />
            </label>
            <label className="field">
              {t("From this call", "Z tohoto hovoru")}
              <select
                required
                value={selectedCall}
                onChange={(e) => setSelectedCall(e.target.value)}
              >
                <option value="">{t("Choose a call", "Vyberte hovor")}</option>
                {workspace.calls.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setCreating(false)}>
                {t("Cancel", "Zrušit")}
              </Button>
              <Button type="submit">
                {t("Create action item", "Vytvořit úkol")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
export function ActionDetail({
  id,
  onClose,
  onOpen,
}: {
  id: string;
  onClose: () => void;
  onOpen: (id: string) => void;
}) {
  const {
    workspace,
    t,
    updateAction,
    updateWorkspace,
    addAction,
    user,
    notify,
    language,
  } = useMinute();
  const action = workspace?.actions.find((a) => a.id === id);
  const [title, setTitle] = useState(action?.title || "");
  const [description, setDescription] = useState(action?.description || "");
  const [assignee, setAssignee] = useState(action?.assignee || "");
  const [dueDate, setDueDate] = useState(action?.dueDate || "");
  const [callIds, setCallIds] = useState(action?.callIds || []);
  const [parentId, setParentId] = useState(action?.parentId || "");
  const [relatedIds, setRelatedIds] = useState(action?.relatedIds || []);
  const [comment, setComment] = useState("");
  const [subtask, setSubtask] = useState("");
  const [tab, setTab] = useState("details");
  if (!action || !workspace) return null;
  const children = workspace.actions.filter((a) => a.parentId === id);
  function isDescendant(candidateId: string): boolean {
    const seen = new Set<string>();
    let candidate = workspace?.actions.find((a) => a.id === candidateId);
    while (candidate?.parentId && !seen.has(candidate.id)) {
      seen.add(candidate.id);
      if (candidate.parentId === id) return true;
      candidate = workspace?.actions.find((a) => a.id === candidate?.parentId);
    }
    return false;
  }
  function save(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !callIds.length) return;
    updateWorkspace((w) => ({
      ...w,
      actions: w.actions.map((a) =>
        a.id === id
          ? {
              ...a,
              title: title.trim(),
              description,
              assignee,
              dueDate,
              callIds,
              parentId: parentId || undefined,
              relatedIds,
              history: [
                ...a.history,
                { text: "Updated details", date: new Date().toISOString() },
              ],
            }
          : {
              ...a,
              relatedIds: relatedIds.includes(a.id)
                ? [...new Set([...a.relatedIds, id])]
                : a.relatedIds.filter((r) => r !== id),
            },
      ),
    }));
    notify(t("Action item saved.", "Úkol uložen."));
    onClose();
  }
  return (
    <Modal
      title={t("A little follow-through", "Od slov k činům")}
      onClose={onClose}
      wide
    >
      <div className="task-detail-status">
        <button
          className={`completion-pill ${action.completed ? "complete" : ""}`}
          onClick={() =>
            updateAction(
              id,
              { completed: !action.completed },
              action.completed ? "Reopened" : "Marked complete",
            )
          }
        >
          <Icon name={action.completed ? "check" : "clock"} size={15} />
          {action.completed
            ? t("Completed", "Dokončeno")
            : t("To do", "K dokončení")}
        </button>
        <span className="muted small">
          {t("Created", "Vytvořeno")}{" "}
          {shortDate(
            action.history[0]?.date || new Date().toISOString(),
            language,
          )}
        </span>
      </div>
      <div className="detail-tabs">
        {[
          ["details", t("Details", "Podrobnosti")],
          ["discussion", t("Discussion", "Diskuze")],
          ["history", t("Change log", "Historie změn")],
        ].map(([key, label]) => (
          <button
            className={tab === key ? "active" : ""}
            key={key}
            onClick={() => setTab(key)}
          >
            {label}
            {key === "discussion" && action.comments.length > 0 && (
              <span className="count-badge">{action.comments.length}</span>
            )}
          </button>
        ))}
      </div>
      {tab === "details" ? (
        <form onSubmit={save}>
          <label className="field">
            {t("Title", "Název")}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label className="field">
            {t("Description", "Popis")}
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <div className="form-grid">
            <label className="field">
              {t("Assignee", "Přiřazeno")}
              <input
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder={t("Unassigned", "Nepřiřazeno")}
              />
            </label>
            <label className="field">
              {t("Due date", "Termín")}
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                onInput={(e) => setDueDate(e.currentTarget.value)}
              />
            </label>
          </div>
          <label className="field">
            {t("Parent action item", "Nadřazený úkol")}
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">{t("No parent", "Žádný nadřazený úkol")}</option>
              {workspace.actions
                .filter((a) => a.id !== id && !isDescendant(a.id))
                .map((a) => (
                  <option value={a.id} key={a.id}>
                    {a.title}
                  </option>
                ))}
            </select>
          </label>
          <fieldset className="field check-field">
            <legend>
              {t(
                "Linked calls (at least one)",
                "Propojené hovory (alespoň jeden)",
              )}
            </legend>
            {workspace.calls.map((c) => (
              <label key={c.id}>
                <input
                  type="checkbox"
                  checked={callIds.includes(c.id)}
                  onChange={(e) =>
                    setCallIds(
                      e.target.checked
                        ? [...callIds, c.id]
                        : callIds.filter((cId) => cId !== c.id),
                    )
                  }
                />
                {c.title}
              </label>
            ))}
            {!callIds.length && (
              <span className="form-error">
                {t("Link at least one call.", "Propojte alespoň jeden hovor.")}
              </span>
            )}
          </fieldset>
          <details className="related-details">
            <summary>
              {t("Related action items", "Související úkoly")}{" "}
              <span className="count-badge">{relatedIds.length}</span>
            </summary>
            <div className="check-field related-list">
              {workspace.actions
                .filter((a) => a.id !== id)
                .map((a) => (
                  <label key={a.id}>
                    <input
                      type="checkbox"
                      checked={relatedIds.includes(a.id)}
                      onChange={(e) =>
                        setRelatedIds(
                          e.target.checked
                            ? [...relatedIds, a.id]
                            : relatedIds.filter((r) => r !== a.id),
                        )
                      }
                    />
                    {a.title}
                  </label>
                ))}
            </div>
          </details>
          <section className="subtasks-section">
            <h3>
              {t("Subtasks", "Podúkoly")}{" "}
              <span className="count-badge">{children.length}</span>
            </h3>
            {children.map((child) => (
              <ActionRow key={child.id} action={child} onOpen={onOpen} />
            ))}
            <div className="inline-add">
              <input
                value={subtask}
                onChange={(e) => setSubtask(e.target.value)}
                placeholder={t("Add a smaller step…", "Přidat menší krok…")}
              />
              <Button
                variant="secondary"
                disabled={!subtask.trim()}
                onClick={() => {
                  addAction(subtask.trim(), action.callIds, id);
                  setSubtask("");
                }}
              >
                <Icon name="plus" size={16} />
                {t("Add", "Přidat")}
              </Button>
            </div>
          </section>
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>
              {t("Cancel", "Zrušit")}
            </Button>
            <Button type="submit" disabled={!title.trim() || !callIds.length}>
              {t("Save changes", "Uložit změny")}
            </Button>
          </div>
        </form>
      ) : tab === "discussion" ? (
        <div className="discussion">
          <div className="comments">
            {action.comments.map((c) => (
              <div className="comment" key={c.id}>
                <Avatar name={c.author} small />
                <div>
                  <strong>{c.author}</strong>
                  <time>{shortDate(c.date, language)}</time>
                  <p>{c.text}</p>
                </div>
              </div>
            ))}
            {!action.comments.length && (
              <p className="muted">
                {t("No comments yet.", "Zatím žádné komentáře.")}
              </p>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!comment.trim()) return;
              updateAction(
                id,
                {
                  comments: [
                    ...action.comments,
                    {
                      id: uid(),
                      text: comment.trim(),
                      author: user?.name || "You",
                      date: new Date().toISOString(),
                    },
                  ],
                },
                "Added a comment",
              );
              setComment("");
            }}
          >
            <label className="field">
              {t("Add a comment", "Přidat komentář")}
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </label>
            <div className="modal-actions">
              <Button type="submit" disabled={!comment.trim()}>
                {t("Post comment", "Odeslat komentář")}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="history-list">
          {[...action.history].reverse().map((entry, i) => (
            <div key={i}>
              <span className="status-dot" />
              <span>{entry.text}</span>
              <time>
                {new Date(entry.date).toLocaleString(
                  language === "cs" ? "cs-CZ" : "en-US",
                  { dateStyle: "medium", timeStyle: "short" },
                )}
              </time>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
