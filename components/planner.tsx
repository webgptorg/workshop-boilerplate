"use client";
import { useState } from "react";
import type { AppData } from "@/lib/types";
import { proposeMeal } from "@/lib/planner";
import { Button } from "./ui/button";
import type { SaveAction } from "./forms";
export function Planner({
  data,
  onSave,
  isPending,
}: {
  data: AppData;
  onSave: SaveAction;
  isPending: boolean;
}) {
  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
  const [targetId, setTargetId] = useState(String(data.meals[0].id));
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
  return (
    <section className="planner-panel">
      <h3>Zařadit námět do jídelníčku</h3>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setIsPreviewVisible(true);
        }}
      >
        <label>
          Námět
          <select
            value={ideaId}
            onChange={(event) => {
              setIdeaId(event.target.value);
              setIsPreviewVisible(false);
            }}
            required
          >
            <option value="">Vyberte námět</option>
            {data.ideas.map((idea) => (
              <option key={idea.id} value={idea.id}>
                {idea.text}
              </option>
            ))}
          </select>
        </label>
        <label>
          Nahradit jídlo
          <select
            value={targetId}
            onChange={(event) => {
              setTargetId(event.target.value);
              setIsPreviewVisible(false);
            }}
          >
            {data.meals.map((meal) => (
              <option key={meal.id} value={meal.id}>
                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
                {meal.name}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" variant="secondary" disabled={!IDEA}>
          Připravit návrh
        </Button>
      </form>
      {isPreviewVisible && IDEA && (
        <div className="proposal">
          <h3>{PROPOSAL.meal.name}</h3>
          <p>{PROPOSAL.meal.ingredients}</p>
          <p>{PROPOSAL.reason}</p>
          <p>
            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
            kuchyně. Ostatní jídla týdne zůstávají zachována.
          </p>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              if (
                await onSave({
                  action: "applyProposal",
                  ideaId: IDEA.id,
                  mealId: Number(targetId),
                  sourceId: PROPOSAL.meal.id,
                  response: new FormData(event.currentTarget).get("response"),
                })
              )
                setIsPreviewVisible(false);
            }}
          >
            <label>
              Odpověď rodiči
              <textarea
                name="response"
                required
                maxLength={1000}
                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
              />
            </label>
            <Button disabled={isPending} type="submit">
              Schválit a zařadit do jídelníčku
            </Button>
          </form>
        </div>
      )}
    </section>
  );
}
