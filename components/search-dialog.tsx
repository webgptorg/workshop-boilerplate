"use client";

import { useState } from "react";
import Link from "next/link";
import { AudioLines, ArrowUpRight, CheckCircle2, Search } from "lucide-react";
import { Modal } from "./ui/modal";
import { useMinute } from "./minute-provider";

export function SearchDialog({ workspaceId, onClose }: { workspaceId: string; onClose: () => void }) {
  const { state, t } = useMinute();
  const [query, setQuery] = useState("");
  const search = query.toLocaleLowerCase();
  const meetings = state.meetings
    .filter(
      (item) =>
        item.workspaceId === workspaceId &&
        `${item.title} ${item.description} ${item.transcript?.text ?? ""}`.toLocaleLowerCase().includes(search),
    )
    .slice(0, 5);
  const todos = state.todos
    .filter((item) => item.workspaceId === workspaceId && `${item.title} ${item.description}`.toLocaleLowerCase().includes(search))
    .slice(0, 5);
  return (
    <Modal title={t("Find your next thought.", "Najděte svou další myšlenku.")} onClose={onClose}>
      <div className="search-field">
        <Search size={18} />
        <input
          autoFocus
          placeholder={t("Search meetings, transcripts, and todos…", "Hledat schůzky, přepisy a úkoly…")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="search-results">
        {!!meetings.length && (
          <>
            <div className="eyebrow">{t("MEETINGS", "SCHŮZKY")}</div>
            {meetings.map((item) => (
              <Link onClick={onClose} key={item.id} href={`/${workspaceId}/meetings/${item.id}`}>
                <AudioLines size={18} />
                <span>{item.title}</span>
                <ArrowUpRight size={15} />
              </Link>
            ))}
          </>
        )}
        {!!todos.length && (
          <>
            <div className="eyebrow">{t("TODOS", "ÚKOLY")}</div>
            {todos.map((item) => (
              <Link onClick={onClose} key={item.id} href={`/${workspaceId}/todos/${item.id}`}>
                <CheckCircle2 size={18} />
                <span>{item.title}</span>
                <ArrowUpRight size={15} />
              </Link>
            ))}
          </>
        )}
        {!meetings.length && !todos.length && (
          <p className="search-empty">{t("No matches. Try a different word.", "Nic nenalezeno. Zkuste jiné slovo.")}</p>
        )}
      </div>
    </Modal>
  );
}
