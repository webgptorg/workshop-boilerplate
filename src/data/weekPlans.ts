import type { DayMenu, WeekPlan } from "@/model/types";

function defineDay(
  date: string,
  soupId: string,
  primaryMealId: string,
  alternativeMealId: string,
  supplementId: string,
): DayMenu {
  return { date, soupId, primaryMealId, alternativeMealId, supplementId };
}

function defineHoliday(date: string, note: string): DayMenu {
  return { date, soupId: null, primaryMealId: null, alternativeMealId: null, supplementId: null, note };
}

/**
 * Week plans seeded from the menus of the kitchen for autumn 2026.
 */
export const INITIAL_WEEK_PLANS: readonly WeekPlan[] = [
  {
    weekStart: "2026-09-21",
    isPublished: true,
    days: [
      defineDay("2026-09-21", "soup-bramborova-pohanka", "main-dzuvec", "main-koprova-omacka", "supplement-ovoce"),
      defineDay("2026-09-22", "soup-hovezi-vyvar-jatrova", "main-testovinovy-salat-krab", "main-bramborovy-gulas", "supplement-kompot"),
      defineDay("2026-09-23", "soup-cervena-repa", "main-kureci-kari", "main-obalovany-kvetak", "supplement-salat"),
      defineDay("2026-09-24", "soup-zeleninova-knedlicky", "main-fazole-bretansku", "main-zahoracky-zavitek", "supplement-ovoce"),
      defineDay("2026-09-25", "soup-hrachova", "main-ovesna-kase", "main-veprovy-gulas", "supplement-ovoce"),
    ],
  },
  {
    weekStart: "2026-09-28",
    isPublished: true,
    days: [
      defineHoliday("2026-09-28", "Státní svátek, nevaří se"),
      defineDay("2026-09-29", "soup-kvetakova", "main-zeleninove-rizoto", "main-samurajska-panev", "supplement-salat"),
      defineDay("2026-09-30", "soup-drozdova", "main-cervena-cocka-leco", "main-bratislavska-kyta", "supplement-repa-okurka"),
      defineDay("2026-10-01", "soup-bramborova-jahly", "main-veprova-kotleta", "main-bramborove-dukatky", "supplement-ovoce"),
      defineDay("2026-10-02", "soup-mexicka-kureci", "main-farfalle-tunak", "main-karbanatek", "supplement-salat"),
    ],
  },
  {
    weekStart: "2026-10-05",
    isPublished: true,
    days: [
      defineDay("2026-10-05", "soup-krkonosske-kyselo", "main-pecena-ryba", "main-kure-zampiony", "supplement-ovoce"),
      defineDay("2026-10-06", "soup-hraskovy-krem", "main-cizrnovy-salat", "main-veprove-nudlicky-kari", "supplement-kompot"),
      defineDay("2026-10-07", "soup-kapustova", "main-ryzovy-nakyp", "main-kureci-stripsy", "supplement-salat"),
      defineDay("2026-10-08", "soup-dynova", "main-sojova-bolognese", "main-plnene-knedliky", "supplement-kompot"),
      defineDay("2026-10-09", "soup-hovezi-vyvar-testovina", "main-veprove-namornicku", "main-fazolove-lusky", "supplement-ovoce"),
    ],
  },
  {
    weekStart: "2026-10-12",
    isPublished: false,
    days: [
      defineDay("2026-10-12", "soup-porkova", "main-dusena-zelenina", "main-kureci-kari-ananas", "supplement-ovoce"),
      defineDay("2026-10-13", "soup-rajska-testovina", "main-zeleninovy-kuskus", "main-recke-biftecky", "supplement-salat"),
      defineDay("2026-10-14", "soup-frankfurtska", "main-kure-susena-rajcata", "main-kvetak-holandsku", "supplement-kompot"),
      defineDay("2026-10-15", "soup-brokolicovy-krem", "main-hrachova-kase", "main-lasagne", "supplement-repa-okurka"),
      defineDay("2026-10-16", "soup-kureci-vyvar-drobeni", "main-veprova-panenka", "main-gnocchi", "supplement-ovoce"),
    ],
  },
];
