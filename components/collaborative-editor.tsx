"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  drawSelection,
  keymap,
  placeholder,
} from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { yCollab, yUndoManagerKeymap } from "y-codemirror.next";
import type { RoomConnection } from "@/lib/room-connection";

export function CollaborativeEditor({
  connection,
  font,
  size,
}: {
  connection: RoomConnection;
  font: string;
  size: number;
}) {
  const parent = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!parent.current) return;
    const text = connection.doc.getText("body");
    const view = new EditorView({
      parent: parent.current,
      state: EditorState.create({
        doc: text.toString(),
        extensions: [
          EditorView.lineWrapping,
          drawSelection(),
          placeholder("An idea, a thought, a little something…"),
          keymap.of([...yUndoManagerKeymap, ...defaultKeymap]),
          yCollab(text, connection.awareness, {
            undoManager: connection.undoManager,
          }),
          EditorView.contentAttributes.of({
            "aria-label": "Note content",
            "aria-multiline": "true",
            spellcheck: "true",
          }),
          EditorView.domEventHandlers({
            blur: () => {
              connection.awareness.setLocalStateField("cursor", null);
            },
          }),
        ],
      }),
    });
    return () => view.destroy();
  }, [connection]);
  return (
    <div
      ref={parent}
      className={`note-editor font-${font}`}
      style={{ fontSize: size }}
    />
  );
}
