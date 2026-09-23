import { PageHeading } from "@/components/layout/PageHeading";
import { MealCatalogList } from "@/components/staff/MealCatalogList";

export default function StaffMealsPage() {
  return (
    <>
      <PageHeading title="Jídla">
        <p>Název, suroviny a alergeny tak, jak je uvidí strávníci.</p>
      </PageHeading>
      <MealCatalogList />
    </>
  );
}
