"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, Field } from "@/components/ui";

interface IdeaFormProps {
  readonly onSubmit: (text: string) => void;
}

export function IdeaForm({ onSubmit }: IdeaFormProps) {
  const [text, setText] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedText = text.trim();

    if (trimmedText === "") {
      return;
    }

    onSubmit(trimmedText);
    setText("");
  }

  return (
    <Card>
      <form className="idea-form" onSubmit={handleSubmit}>
        <Field label="Nový námět" hint="Stačí jedna věta, jídelna námět zapracuje a odpoví.">
          <textarea className="input" rows={2} value={text} onChange={(event) => setText(event.target.value)} placeholder="Například: Děti mají rády kuřecí nudličky s rýží." />
        </Field>
        <div className="form-actions">
          <Button type="submit" disabled={text.trim() === ""}>
            Poslat námět
          </Button>
        </div>
      </form>
    </Card>
  );
}
