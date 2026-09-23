interface EmptyStateProps {
  readonly text: string;
}

export function EmptyState({ text }: EmptyStateProps) {
  return <p className="empty-state">{text}</p>;
}
