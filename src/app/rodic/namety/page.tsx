"use client";

import { IdeaCard } from "@/components/ideas/IdeaCard";
import { IdeaForm } from "@/components/ideas/IdeaForm";
import { PageHeading } from "@/components/layout/PageHeading";
import { Card, EmptyState } from "@/components/ui";
import { useAppData } from "@/hooks/AppDataProvider";
import { useParentChild } from "@/hooks/useParentChild";

export default function ParentIdeasPage() {
  const { parent } = useParentChild();
  const { ideas } = useAppData();
  const ownIdeas = ideas.ideas.filter((idea) => idea.authorId === parent.id).reverse();

  return (
    <>
      <PageHeading title="Náměty">
        <p>Co vaříte doma a dětem chutná. Jídelna rozhodne a vysvětlí proč.</p>
      </PageHeading>
      <IdeaForm onSubmit={(text) => ideas.addIdea(parent.id, text)} />
      {ownIdeas.length === 0 ? (
        <Card>
          <EmptyState text="Zatím jste neposlali žádný námět." />
        </Card>
      ) : (
        ownIdeas.map((idea) => <IdeaCard key={idea.id} idea={idea} authorName={parent.displayName} />)
      )}
    </>
  );
}
