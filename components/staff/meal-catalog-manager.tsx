"use client";

import { Pencil, Plus } from "lucide-react";
import { useId, useState } from "react";
import { MealSummary } from "@/components/meals/meal-summary";
import { Button, Input } from "@/components/ui";
import { useStoreValue } from "@/hooks/use-store-value";
import {
  createMealDraft,
  listMealsByCourse,
  mealCatalogStore,
  saveMeal,
  type Meal,
  type MealCourse,
} from "@/lib/meals";
import { MealForm } from "./meal-form";

const COURSE_LABELS: Readonly<Record<MealCourse, string>> = {
  MAIN: "Hlavní jídla",
  SOUP: "Polévky",
};

const COURSE_LIST: readonly MealCourse[] = ["MAIN", "SOUP"];

function matchesSearch(meal: Meal, searchText: string): boolean {
  const normalizedSearch = searchText.trim().toLocaleLowerCase("cs");

  if (normalizedSearch === "") {
    return true;
  }

  return `${meal.name} ${meal.description}`.toLocaleLowerCase("cs").includes(normalizedSearch);
}

/**
 * The canteen's bank of soups and main courses.
 */
export function MealCatalogManager() {
  const searchId = useId();
  const meals = useStoreValue(mealCatalogStore);
  const [course, setCourse] = useState<MealCourse>("MAIN");
  const [searchText, setSearchText] = useState("");
  const [editedMeal, setEditedMeal] = useState<Meal | null>(null);

  const visibleMeals = listMealsByCourse(meals, course).filter((meal) => matchesSearch(meal, searchText));

  function handleSave(meal: Meal) {
    saveMeal(meal);
    setEditedMeal(null);
  }

  return (
    <section className="catalog" aria-label="Jídla">
      <div className="catalog-toolbar">
        <div className="segmented" role="tablist" aria-label="Druh jídla">
          {COURSE_LIST.map((candidateCourse) => (
            <button
              key={candidateCourse}
              type="button"
              role="tab"
              aria-selected={course === candidateCourse}
              className="segmented-option"
              onClick={() => setCourse(candidateCourse)}
            >
              {COURSE_LABELS[candidateCourse]}
            </button>
          ))}
        </div>

        <label className="visually-hidden" htmlFor={searchId}>
          Hledat jídlo
        </label>
        <Input
          id={searchId}
          type="search"
          placeholder="Hledat…"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          className="catalog-search"
        />

        <Button variant="secondary" onClick={() => setEditedMeal(createMealDraft(course))}>
          <Plus size={18} />
          {course === "SOUP" ? "Přidat polévku" : "Přidat hlavní jídlo"}
        </Button>
      </div>

      {editedMeal !== null && !meals.some((meal) => meal.id === editedMeal.id) ? (
        <div className="catalog-editor">
          <MealForm meal={editedMeal} onSave={handleSave} onCancel={() => setEditedMeal(null)} />
        </div>
      ) : null}

      {visibleMeals.length === 0 ? <p className="empty-state">Nic nenalezeno.</p> : null}

      <ul className="catalog-list">
        {visibleMeals.map((meal) => (
          <li key={meal.id} className="catalog-item">
            {editedMeal?.id === meal.id ? (
              <MealForm meal={meal} onSave={handleSave} onCancel={() => setEditedMeal(null)} />
            ) : (
              <>
                <MealSummary meal={meal} />
                <Button variant="ghost" size="small" onClick={() => setEditedMeal(meal)} aria-label={`Upravit ${meal.name}`}>
                  <Pencil size={16} />
                  Upravit
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
