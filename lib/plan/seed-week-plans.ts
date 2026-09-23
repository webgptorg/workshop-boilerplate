import { createSeededWeekPlan, type DaySeed } from "./create-week-plan";
import type { WeekPlanCollection } from "./types";

const SUPPLEMENT_COMPOTE = "Ovocný kompot, voda, mléko, ovocný čaj";
const SUPPLEMENT_FRUIT = "Ovoce, voda, mléko, ovocný čaj";
const SUPPLEMENT_SALAD = "Zeleninový salát, voda, mléko, ovocný čaj";
const SUPPLEMENT_PICKLES = "Červená řepa nebo kyselá okurka, voda, mléko, ovocný čaj";

function day(
  supplement: string,
  soupMealId: string,
  primaryMealId: string,
  alternativeMealId: string,
): DaySeed {
  return { supplement, soupMealId, primaryMealId, alternativeMealId };
}

/**
 * Six weeks copied from the real menu in `docs/stavajici_jidelnicky.txt`.
 */
const SEED_WEEK_PLAN_LIST = [
  createSeededWeekPlan("2026-09-07", [
    day(SUPPLEMENT_COMPOTE, "soup-celerova-kremova", "main-rybi-file-na-bazalce", "main-milanska-smes"),
    day(SUPPLEMENT_COMPOTE, "soup-bramborova-s-houbami", "main-cina-z-kureciho-masa", "main-kapustove-placicky"),
    day(SUPPLEMENT_FRUIT, "soup-fazolova-bila", "main-rajska-omacka-s-koulemi", "main-duseny-spenat"),
    day(SUPPLEMENT_FRUIT, "soup-kureci-vyvar-s-testovinou", "main-krupicova-kase", "main-debrecinsky-gulas"),
    day(SUPPLEMENT_PICKLES, "soup-brokolicovy-krem", "main-cocka-na-kyselo", "main-gratinovane-hermelinove-brambory"),
  ]),
  createSeededWeekPlan("2026-09-14", [
    day(SUPPLEMENT_FRUIT, "soup-vlockova", "main-siroke-nudle-s-makem", "main-uzene-maso"),
    day(SUPPLEMENT_PICKLES, "soup-americka-kukuricna", "main-kuskus-s-tunakem", "main-rozlitany-ptacek"),
    day(SUPPLEMENT_FRUIT, "soup-rybi-krem", "main-segedinsky-gulas", "main-spagety-s-cesnekovym-pestem"),
    day(SUPPLEMENT_SALAD, "soup-spenatova-s-vejcem", "main-mexicky-fazolovy-gulas", "main-kvetakovy-mozecek"),
    day(SUPPLEMENT_COMPOTE, "soup-madarska-chlebova", "main-dusena-mrkev", "main-kureci-platek-na-lecu"),
  ]),
  createSeededWeekPlan("2026-09-21", [
    day(SUPPLEMENT_FRUIT, "soup-bramborova-s-pohankou", "main-dzuvec", "main-koprova-omacka"),
    day(SUPPLEMENT_COMPOTE, "soup-hovezi-vyvar-s-jatrovou-zavarkou", "main-testovinovy-salat-s-krabim-masem", "main-bramborovy-gulas-s-uzeninou"),
    day(SUPPLEMENT_SALAD, "soup-z-cervene-repy", "main-kureci-kousky-na-kari", "main-obalovany-kvetak"),
    day(SUPPLEMENT_FRUIT, "soup-zeleninova-s-krupicovymi-knedlicky", "main-fazole-po-bretansku", "main-zahoracky-zavitek"),
    day(SUPPLEMENT_FRUIT, "soup-hrachova", "main-ovesna-kase", "main-veprovy-gulas"),
  ]),
  createSeededWeekPlan("2026-09-28", [
    { closedNote: "Státní svátek – Den české státnosti" },
    day(SUPPLEMENT_SALAD, "soup-kvetakova", "main-zeleninove-rizoto", "main-samurajska-panev"),
    day(SUPPLEMENT_PICKLES, "soup-drozdova-s-vejcem", "main-cervena-cocka-s-lecem", "main-bratislavska-veprova-kyta"),
    day(SUPPLEMENT_FRUIT, "soup-bramborova-s-jahly", "main-veprova-prirodni-kotleta", "main-bramborove-dukatky"),
    day(SUPPLEMENT_SALAD, "soup-mexicka-kureci", "main-farfalle-s-tunakem", "main-peceny-karbanatek"),
  ]),
  createSeededWeekPlan("2026-10-05", [
    day(SUPPLEMENT_FRUIT, "soup-krkonosske-kyselo", "main-pecena-ryba-na-zelenine", "main-kureci-maso-na-zampionech"),
    day(SUPPLEMENT_COMPOTE, "soup-hraskovy-krem", "main-salat-z-cizrny", "main-veprove-nudlicky-na-kari"),
    day(SUPPLEMENT_SALAD, "soup-kapustova", "main-ryzovy-nakyp-se-svestkami", "main-kureci-stripsy"),
    day(SUPPLEMENT_COMPOTE, "soup-dynova-kremova", "main-sojova-bolognese", "main-bramborove-knedliky-plnene-uzenym"),
    day(SUPPLEMENT_FRUIT, "soup-hovezi-vyvar-s-testovinou", "main-veprove-po-namornicku", "main-fazolove-lusky-na-kyselo"),
  ]),
  createSeededWeekPlan("2026-10-12", [
    day(SUPPLEMENT_FRUIT, "soup-porkova", "main-dusena-michana-zelenina", "main-kureci-kousky-na-kari-s-ananasem"),
    day(SUPPLEMENT_SALAD, "soup-rajska-s-testovinou", "main-zeleninovy-kuskus-s-olivami", "main-recke-biftecky"),
    day(SUPPLEMENT_COMPOTE, "soup-frankfurtska", "main-kureci-kousky-na-susenych-rajcatech", "main-zapekany-kvetak-po-holandsku"),
    day(SUPPLEMENT_PICKLES, "soup-brokolicovy-krem", "main-hrachova-kase", "main-lasagne-bolognese"),
    day(SUPPLEMENT_FRUIT, "soup-kureci-vyvar-s-drobenim", "main-veprova-panenka-na-slanine", "main-gnocchi-v-rajcatove-omacce"),
  ]),
];

export const SEED_WEEK_PLANS: WeekPlanCollection = Object.fromEntries(
  SEED_WEEK_PLAN_LIST.map((weekPlan) => [weekPlan.weekStartDate, weekPlan]),
);
