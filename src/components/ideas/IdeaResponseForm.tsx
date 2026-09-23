"use client";

import { useState, type FormEvent } from "react";
import { Button, Field } from "@/components/ui";
import type { MealIdea, MealIdeaStatus } from "@/model/types";
import { IDEA_STATUS_LABELS, IDEA_STATUS_ORDER } from "./ideaStatus";

interface IdeaResponseFormProps {
  readonly idea: MealIdea;
  readonly onRespond: (status: MealIdeaStatus, response: string) => void;
}

/**
 * The staff decides about the idea and explains the decision in one or two sentences.
 */
export function IdeaResponseForm({ idea, onRespond }: IdeaResponseFormProps) {
  const [status, setStatus] = useState<MealIdeaStatus>(idea.status);
  const [response, setResponse] = useState(idea.response);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onRespond(status, response.trim());
  }

  return (
    <form className="idea-response-form" onSubmit={handleSubmit}>
      <Field label="Rozhodnutí">
        <select className="input" value={status} onChange={(event) => setStatus(event.target.value as MealIdeaStatus)}>
          {IDEA_STATUS_ORDER.map((option) => (
            <option key={option} value={option}>
              {IDEA_STATUS_LABELS[option]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Vysvětlení pro rodiče" hint="Kdy a v jaké podobě se jídlo objeví, nebo proč to nejde a co místo něj.">
        <textarea className="input" rows={3} value={response} onChange={(event) => setResponse(event.target.value)} required={status !== "new"} />
      </Field>
      <div className="form-actions">
        <Button type="submit" size="small">
          Uložit odpověď
        </Button>
      </div>
    </form>
  );
}
