"use client";

import { DinerWeekView } from "@/components/diner/DinerWeekView";
import { PageHeading } from "@/components/layout/PageHeading";
import { useParentChild } from "@/hooks/useParentChild";

export default function ParentMenuPage() {
  const { parent, child } = useParentChild();

  return (
    <>
      <PageHeading title="Týdenní jídelníček">
        <p>
          {child.displayName}, třída {child.className}
        </p>
      </PageHeading>
      <DinerWeekView pupilId={child.id} authorId={parent.id} authorRole="parent" />
    </>
  );
}
