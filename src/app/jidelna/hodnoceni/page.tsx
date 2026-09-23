import { PageHeading } from "@/components/layout/PageHeading";
import { FeedbackOverview } from "@/components/staff/FeedbackOverview";

export default function StaffFeedbackPage() {
  return (
    <>
      <PageHeading title="Hodnocení">
        <p>Jídla s nejhorším hodnocením jsou první.</p>
      </PageHeading>
      <FeedbackOverview />
    </>
  );
}
