import Anthropic from "@anthropic-ai/sdk";
import { AppError } from "../src/errors/app-error";
import { spaceTrim } from "./space-trim";
import type { Meal } from "./types";

export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
export const IDEA_PROMPT_VERSION = "idea-structure-v1";
export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
const MAX_IDEA_LENGTH = 1000;
const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
const IDEA_PATTERNS: [RegExp, string][] = [
  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
];
export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
export type MealProposal = {
  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
};
export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };

function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
function inferStructure(text: string, meals: Meal[]): IdeaStructure {
  const normalized = normalize(text);
  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
  return {
    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
  };
}

function validateStructure(value: unknown): IdeaStructure {
  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
  const item = value as Record<string, unknown>;
  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
  return item as unknown as IdeaStructure;
}

async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
  const response = message.content.find((part) => part.type === "text")?.text ?? "";
  try { return { structure: validateStructure(JSON.parse(response)), response }; }
  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
}

function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
  const ranked = candidates.map((candidate) => {
    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
  });
  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
}

function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
}

export function proposeMeal(text: string, meals: Meal[]): MealProposal {
  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
  const structure = inferStructure(text, meals);
  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
  const isFallback = !process.env.ANTHROPIC_API_KEY;
  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
  const slots = meal ? rankSlots(meal, meals) : [];
  const selected = slots[0];
  const explanation = explain(meal, selected, structure, reason);
  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
}

export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
  const parsed = await parseWithClaude(text);
  const deterministic = proposeMeal(text, meals);
  const structure = parsed.structure;
  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
  return result;
}
