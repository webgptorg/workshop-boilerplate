import type { ReactNode } from "react";
import { Badge, Card } from "@/components/ui";
import type { MealIdea } from "@/model/types";
import { formatDateTime } from "@/planning/calendar";
import { IDEA_STATUS_LABELS, IDEA_STATUS_TONES } from "./ideaStatus";

interface IdeaCardProps {
  readonly idea: MealIdea;
  readonly authorName: string;
  readonly children?: ReactNode;
}

export function IdeaCard({ idea, authorName, children }: IdeaCardProps) {
  return (
    <Card className="idea-card">
      <div className="idea-card-header">
        <Badge tone={IDEA_STATUS_TONES[idea.status]}>{IDEA_STATUS_LABELS[idea.status]}</Badge>
        <span className="feedback-meta">
          {authorName} · {formatDateTime(idea.createdAt)}
        </span>
      </div>
      <p className="idea-text">{idea.text}</p>
      {idea.response && (
        <p className="idea-response">
          <span className="idea-response-label">Odpověď jídelny</span>
          {idea.response}
        </p>
      )}
      {children}
    </Card>
  );
}
