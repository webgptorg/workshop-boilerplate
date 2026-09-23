"use client";

import { useSession } from "@/auth/SessionProvider";
import { DinerWeekView } from "@/components/diner/DinerWeekView";
import { PageHeading } from "@/components/layout/PageHeading";

export default function PupilMenuPage() {
  const { currentUser } = useSession();

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <PageHeading title="Týdenní jídelníček">
        <p>Vyber si oběd na každý den a ohodnoť, co ti chutnalo.</p>
      </PageHeading>
      <DinerWeekView pupilId={currentUser.id} authorId={currentUser.id} authorRole="pupil" />
    </>
  );
}
