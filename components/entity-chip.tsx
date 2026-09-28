"use client";

import Link from "next/link";
import { AudioLines, Check, Circle, Layers2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useMinute } from "./minute-provider";

export function EntityChip({ type, id, compact = false }: { type: "meeting" | "todo" | "workspace"; id: string; compact?: boolean }) {
  const { state } = useMinute();
  const entity =
    type === "meeting"
      ? state.meetings.find((item) => item.id === id)
      : type === "todo"
        ? state.todos.find((item) => item.id === id)
        : state.workspaces.find((item) => item.id === id);
  if (!entity) return null;
  const workspaceId = "workspaceId" in entity ? entity.workspaceId : entity.id;
  const href = type === "workspace" ? `/${workspaceId}` : `/${workspaceId}/${type === "todo" ? "todos" : "meetings"}/${id}`;
  const Icon =
    type === "meeting" ? AudioLines : type === "workspace" ? Layers2 : "completed" in entity && entity.completed ? Check : Circle;
  return (
    <Link
      href={href}
      className={`entity-chip entity-${type} ${compact ? "chip-compact" : ""}`}
      title={"title" in entity ? entity.title : entity.name}
    >
      <Icon size={13} />
      <span>{"title" in entity ? entity.title : entity.name}</span>
    </Link>
  );
}

export function Markdown({ children }: { children: string }) {
  const { state } = useMinute();
  // Bare internal URLs render like explicit Markdown links as well.
  const content = children.replace(
    /(?<![\](])\bhttps?:\/\/[^\s<>]+|(?<![\w\](])\/[a-zA-Z0-9-]+\/(?:todos|meetings)\/[a-zA-Z0-9-]+/g,
    (match) => `[${match}](${match})`,
  );
  return (
    <div className="markdown">
      <ReactMarkdown
        components={{
          a: ({ href, children: label }) => {
            let pathname = href ?? "";
            if (pathname.startsWith("http")) {
              try {
                const url = new URL(pathname);
                if (url.origin !== window.location.origin)
                  return (
                    <a href={href} target="_blank" rel="noreferrer">
                      {label}
                    </a>
                  );
                pathname = url.pathname;
              } catch {
                return <span>{label}</span>;
              }
            }
            const [workspaceId, kind, id] = pathname.split("/").filter(Boolean);
            const workspace = state.workspaces.find((item) => item.id === workspaceId);
            if (workspace && (kind === "meetings" || kind === "todos") && id)
              return <EntityChip type={kind === "meetings" ? "meeting" : "todo"} id={id} />;
            if (workspace && !kind) return <EntityChip type="workspace" id={workspace.id} />;
            return <a href={href}>{label}</a>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
