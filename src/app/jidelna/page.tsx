import { PageHeading } from "@/components/layout/PageHeading";
import { WeekPlanEditor } from "@/components/staff/WeekPlanEditor";

export default function StaffPlanPage() {
  return (
    <>
      <PageHeading title="Plán týdne">
        <p>Změny se ukládají hned. Žáci a rodiče vidí jen zveřejněné týdny.</p>
      </PageHeading>
      <WeekPlanEditor />
    </>
  );
}
