"use client";

import { findUserById } from "@/auth/findUserById";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { IdeaResponseForm } from "@/components/ideas/IdeaResponseForm";
import { PageHeading } from "@/components/layout/PageHeading";
import { Card, EmptyState } from "@/components/ui";
import { useAppData } from "@/hooks/AppDataProvider";

export default function StaffIdeasPage() {
  const { ideas } = useAppData();
  const sortedIdeas = [...ideas.ideas].sort((a, b) => Number(b.status === "new") - Number(a.status === "new"));

  return (
    <>
      <PageHeading title="Náměty od rodičů">
        <p>Každý námět dostane odpověď, i když se nezařadí.</p>
      </PageHeading>
      {sortedIdeas.length === 0 ? (
        <Card>
          <EmptyState text="Zatím žádné náměty." />
        </Card>
      ) : (
        sortedIdeas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} authorName={findUserById(idea.authorId).displayName}>
            <IdeaResponseForm idea={idea} onRespond={(status, response) => ideas.respondToIdea(idea.id, status, response)} />
          </IdeaCard>
        ))
      )}
    </>
  );
}
