"use client";

import { useState } from "react";
import { AllergenChips } from "@/components/menu/AllergenChips";
import { MealIcon } from "@/components/menu/MealIcon";
import { Badge, Button, Card } from "@/components/ui";
import { useAppData } from "@/hooks/AppDataProvider";
import type { Meal, MealCourse } from "@/model/types";
import { DIET_LABELS } from "@/planning/dietLabels";
import { MealEditor } from "./MealEditor";

const COURSE_LABELS: Readonly<Record<MealCourse, string>> = {
  soup: "Polévky",
  main: "Hlavní jídla",
  supplement: "Doplňky",
};

const COURSE_ORDER: readonly MealCourse[] = ["main", "soup", "supplement"];

export function MealCatalogList() {
  const { mealCatalog } = useAppData();

  return (
    <div className="catalog">
      {COURSE_ORDER.map((course) => (
        <section key={course} className="catalog-section">
          <h2>{COURSE_LABELS[course]}</h2>
          <div className="catalog-list">
            {mealCatalog.meals
              .filter((meal) => meal.course === course)
              .map((meal) => (
                <CatalogItem key={meal.id} meal={meal} onSave={mealCatalog.updateMeal} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function CatalogItem({ meal, onSave }: { readonly meal: Meal; readonly onSave: (meal: Meal) => void }) {
  const [isEditing, setIsEditing] = useState(false);

  function handleSave(savedMeal: Meal) {
    onSave(savedMeal);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <Card className="catalog-item">
        <MealEditor meal={meal} onSave={handleSave} onCancel={() => setIsEditing(false)} />
      </Card>
    );
  }

  return (
    <Card className="catalog-item catalog-item-row">
      <MealIcon icon={meal.icon} />
      <div className="catalog-item-body">
        <div className="meal-row-header">
          <Badge tone="neutral">{DIET_LABELS[meal.diet]}</Badge>
          <span className="catalog-cost">{meal.estimatedCostCzk} Kč</span>
        </div>
        <h3 className="meal-name">{meal.name}</h3>
        <p className="meal-description">{meal.description}</p>
        <AllergenChips allergens={meal.allergens} />
      </div>
      <Button variant="secondary" size="small" onClick={() => setIsEditing(true)}>
        Upravit
      </Button>
    </Card>
  );
}
