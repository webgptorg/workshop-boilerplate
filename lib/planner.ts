export const GROUPS = [
  "Zelenina",
  "Ovoce",
  "Luštěniny",
  "Maso",
  "Ryby",
  "Mléčné výrobky",
  "Obiloviny a brambory",
  "Tuky",
  "Cukr",
] as const;
export type Group = (typeof GROUPS)[number];
export type Ingredient = {
  name: string;
  grams: number;
  group: Group;
  price: number;
};
export type Recipe = {
  id: string;
  name: string;
  side: string;
  soup: string;
  category: string;
  color: string;
  ingredients: Ingredient[];
};
const i = (
  name: string,
  grams: number,
  group: Group,
  price: number,
): Ingredient => ({ name, grams, group, price });
export const RECIPES: Recipe[] = [
  {
    id: "chicken",
    name: "Kuřecí nudličky na zelenině",
    side: "Dušená rýže, okurkový salát",
    soup: "Mrkvová polévka s vločkami",
    category: "Drůbeží maso",
    color: "orange",
    ingredients: [
      i("Kuřecí maso", 80, "Maso", 150),
      i("Rýže", 65, "Obiloviny a brambory", 45),
      i("Mrkev, paprika a okurka", 160, "Zelenina", 40),
      i("Ovesné vločky", 15, "Obiloviny a brambory", 40),
      i("Řepkový olej", 8, "Tuky", 65),
    ],
  },
  {
    id: "pasta",
    name: "Špagety s rajčatovou omáčkou",
    side: "Červená čočka, strouhaný sýr",
    soup: "Zeleninový vývar s bulgurem",
    category: "Bezmasé",
    color: "green",
    ingredients: [
      i("Celozrnné špagety", 75, "Obiloviny a brambory", 65),
      i("Rajčata a kořenová zelenina", 180, "Zelenina", 45),
      i("Červená čočka (suchá)", 30, "Luštěniny", 65),
      i("Tvrdý sýr", 15, "Mléčné výrobky", 190),
      i("Bulgur", 15, "Obiloviny a brambory", 55),
      i("Řepkový olej", 7, "Tuky", 65),
    ],
  },
  {
    id: "fish",
    name: "Pečené rybí filé na bylinkách",
    side: "Šťouchané brambory, zelný salát",
    soup: "Hráškový krém",
    category: "Ryba",
    color: "blue",
    ingredients: [
      i("Rybí filé", 100, "Ryby", 190),
      i("Brambory", 180, "Obiloviny a brambory", 25),
      i("Zelí a hrášek", 140, "Zelenina", 40),
      i("Mléko", 40, "Mléčné výrobky", 25),
      i("Řepkový olej", 8, "Tuky", 65),
    ],
  },
  {
    id: "lentil",
    name: "Čočkový dhal s pečenou zeleninou",
    side: "Rýže basmati, bílý jogurt",
    soup: "Bramborová polévka",
    category: "Luštěniny",
    color: "green",
    ingredients: [
      i("Červená čočka (suchá)", 65, "Luštěniny", 65),
      i("Rýže a brambory", 100, "Obiloviny a brambory", 40),
      i("Mrkev, dýně a cibule", 170, "Zelenina", 40),
      i("Bílý jogurt", 40, "Mléčné výrobky", 60),
      i("Řepkový olej", 8, "Tuky", 65),
    ],
  },
  {
    id: "beef",
    name: "Hovězí na kořenové zelenině",
    side: "Bulgur, jablko",
    soup: "Květáková polévka",
    category: "Hovězí maso",
    color: "orange",
    ingredients: [
      i("Hovězí maso", 75, "Maso", 240),
      i("Bulgur", 70, "Obiloviny a brambory", 55),
      i("Kořenová zelenina a květák", 160, "Zelenina", 40),
      i("Jablko", 100, "Ovoce", 35),
      i("Řepkový olej", 8, "Tuky", 65),
    ],
  },
  {
    id: "sweet",
    name: "Tvarohové těstoviny s ovocem",
    side: "Jablka, skořice, méně cukru",
    soup: "Čočková polévka se zeleninou",
    category: "Sladké jídlo",
    color: "purple",
    ingredients: [
      i("Těstoviny", 75, "Obiloviny a brambory", 50),
      i("Tvaroh", 80, "Mléčné výrobky", 100),
      i("Jablka", 120, "Ovoce", 35),
      i("Čočka (suchá)", 25, "Luštěniny", 60),
      i("Kořenová zelenina", 70, "Zelenina", 40),
      i("Cukr", 8, "Cukr", 25),
      i("Máslo", 8, "Tuky", 200),
    ],
  },
  {
    id: "risotto",
    name: "Zeleninové rizoto se sýrem",
    side: "Červená řepa, hruška",
    soup: "Fazolová polévka",
    category: "Bezmasé",
    color: "green",
    ingredients: [
      i("Rýže", 75, "Obiloviny a brambory", 45),
      i("Hrášek, mrkev a řepa", 170, "Zelenina", 40),
      i("Fazole (suché)", 30, "Luštěniny", 60),
      i("Tvrdý sýr", 20, "Mléčné výrobky", 190),
      i("Hruška", 100, "Ovoce", 40),
      i("Řepkový olej", 8, "Tuky", 65),
    ],
  },
];
export const BASE = ["chicken", "pasta", "fish", "lentil", "beef"];
export const RULE_VERSION = "Pracovní pravidla v1 · katalog 23. 9. 2026";
export type Idea = {
  id: string;
  text: string;
  author: string;
  recipeId: string;
  explanation: string;
  status: "new" | "included" | "declined";
  week?: string;
  reason?: string;
};
export type Plan = { meals: string[]; approved: boolean; rules: string };
export type Data = {
  version: 1;
  plans: Record<string, Plan>;
  ideas: Idea[];
  portions: number;
  limit: number;
};
export const INITIAL: Data = {
  version: 1,
  plans: {},
  portions: 120,
  limit: 38,
  ideas: [
    {
      id: "seed-1",
      text: "Naše děti milují špagety. Šly by někdy zařadit?",
      author: "Rodič · 4. A",
      recipeId: "pasta",
      explanation:
        "Špagety doplníme červenou čočkou a zeleninou, aby byl oběd pestřejší a sytý i bez masa.",
      status: "new",
    },
    {
      id: "seed-2",
      text: "Co zkusit něco s čočkou, třeba jemný dhal?",
      author: "Rodič · 2. B",
      recipeId: "lentil",
      explanation:
        "Připravíme jemný čočkový dhal bez pálivého koření, který se dá vařit ve velkém.",
      status: "new",
    },
    {
      id: "seed-3",
      text: "Doma mají úspěch tvarohové těstoviny s jablky.",
      author: "Rodič · 3. A",
      recipeId: "sweet",
      explanation:
        "Sladké těstoviny doplníme čočkovou polévkou a část cukru nahradíme ovocem.",
      status: "new",
    },
  ],
};
export function recipe(id: string) {
  return RECIPES.find((r) => r.id === id) ?? RECIPES[0];
}
export function cost(r: Recipe) {
  return r.ingredients.reduce(
    (sum, item) => sum + (item.grams * item.price) / 1000,
    0,
  );
}
export function propose(text: string): Pick<Idea, "recipeId" | "explanation"> {
  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (/spaget|carbonara|testovin/.test(normalized))
    return {
      recipeId: "pasta",
      explanation:
        "Nabízíme špagety s rajčaty a čočkou: místo tučné omáčky přidáme zeleninu a luštěniny. Je to varianta z našeho startovního katalogu.",
    };
  if (/kure|nudlick/.test(normalized))
    return {
      recipeId: "chicken",
      explanation:
        "Kuřecí nudličky doplníme rýží a zeleninou; jídlo lze připravit společně pro více porcí.",
    };
  if (/ryb|losos|file/.test(normalized))
    return {
      recipeId: "fish",
      explanation:
        "Navrhujeme pečené rybí filé s bramborami, které se ve velkém připravuje snáze než jednotlivě smažené porce.",
    };
  if (/slad|palacin|knedlik|tvaroh/.test(normalized))
    return {
      recipeId: "sweet",
      explanation:
        "Jako dostupnou sladkou variantu nabízíme tvarohové těstoviny s ovocem a sytou čočkovou polévkou.",
    };
  if (/cock|dhal|lustenin/.test(normalized))
    return {
      recipeId: "lentil",
      explanation:
        "Čočku připravíme jako jemný dhal se zeleninou a rýží, bez pálivého koření.",
    };
  return {
    recipeId: "risotto",
    explanation:
      "Pro tento nápad zatím nemáme recepturu. Jako dostupnou alternativu nabízíme zeleninové rizoto; o vhodnosti náhrady rozhodne vedoucí.",
  };
}
export function weekKey(offset: number) {
  const d = new Date(2026, 8, 28 + offset * 7);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function weekDates(key: string) {
  return Array.from({ length: 5 }, (_, n) => {
    const d = new Date(key + "T12:00:00");
    d.setDate(d.getDate() + n);
    return d;
  });
}
export function validData(value: unknown): value is Data {
  if (!value || typeof value !== "object") return false;
  const d = value as Data;
  return (
    d.version === 1 &&
    Number.isInteger(d.portions) &&
    d.portions > 0 &&
    d.portions <= 2000 &&
    Number.isFinite(d.limit) &&
    d.limit > 0 &&
    d.limit <= 200 &&
    !!d.plans &&
    typeof d.plans === "object" &&
    Object.values(d.plans).every(
      (p) =>
        p &&
        typeof p.approved === "boolean" &&
        typeof p.rules === "string" &&
        Array.isArray(p.meals) &&
        p.meals.length === 5 &&
        p.meals.every((id) => RECIPES.some((r) => r.id === id)),
    ) &&
    Array.isArray(d.ideas) &&
    d.ideas.every(
      (i) =>
        i &&
        typeof i.id === "string" &&
        typeof i.text === "string" &&
        typeof i.author === "string" &&
        typeof i.explanation === "string" &&
        RECIPES.some((r) => r.id === i.recipeId) &&
        ["new", "included", "declined"].includes(i.status),
    )
  );
}
