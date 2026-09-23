"use client";
import { useMemo, useState } from "react";
import type { AppData } from "@/lib/types";
import { proposeMeal } from "@/lib/planner";
import { Button } from "./ui/button";
import type { SaveAction } from "./forms";

export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const idea = data.ideas.find((item) => item.id === Number(ideaId));
  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
  return <section className="planner-panel">
    <h3>Zařadit námět do jídelníčku</h3>
    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
      </select></label>
      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
    </form>
    {isPreviewVisible && idea && proposal && <div className="proposal">
      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
      <p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p>
      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
        <Button disabled={isPending || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
      </form>
    </div>}
  </section>;
}
