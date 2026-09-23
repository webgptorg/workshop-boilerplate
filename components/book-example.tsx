"use client";

import { BookEditor, type BookEditorProps } from "@promptbook/components";
import { useState } from "react";

type BookValue = NonNullable<BookEditorProps["value"]>;

const INITIAL_BOOK = `PERSONA
You are a practical AI teammate.

GOAL
Turn company knowledge into useful action.

RULE
Prefer known facts over assumptions.

STYLE
Be concise and practical.` as BookValue;

export function BookExample() {
  const [value, setValue] = useState<BookValue>(INITIAL_BOOK);

  return (
    <div className="book-example">
      <div className="book-example-bar">
        <strong>assistant.book</strong>
        <button type="button" onClick={() => setValue(INITIAL_BOOK)}>
          Reset
        </button>
      </div>
      <BookEditor value={value} onChange={setValue} height="460px" />
    </div>
  );
}
