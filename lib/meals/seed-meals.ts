import type { AllergenCode } from "./allergens";
import type { MealCategory } from "./categories";
import type { MealIconName } from "./icons";
import type { Meal } from "./types";

function soup(
  id: string,
  name: string,
  category: MealCategory,
  allergenCodes: AllergenCode[],
  description = "",
): Meal {
  return { id, course: "SOUP", name, description, category, iconName: "SOUP", allergenCodes };
}

function main(
  id: string,
  name: string,
  description: string,
  category: MealCategory,
  iconName: MealIconName,
  allergenCodes: AllergenCode[],
): Meal {
  return { id, course: "MAIN", name, description, category, iconName, allergenCodes };
}

/**
 * Starting catalog built from six weeks of the real menu (see `docs/stavajici_jidelnicky.txt`).
 *
 * Allergen codes are copied from the source menu; bread served with the soup is not included.
 */
export const SEED_MEALS: readonly Meal[] = [
  // Soups
  soup("soup-celerova-kremova", "Celerová krémová", "VEGETARIAN", [1, 7, 9]),
  soup("soup-bramborova-s-houbami", "Bramborová s houbami", "VEGETARIAN", [1, 9]),
  soup("soup-fazolova-bila", "Fazolová bílá", "VEGETARIAN", [1]),
  soup("soup-kureci-vyvar-s-testovinou", "Kuřecí vývar s masem a těstovinou", "POULTRY", [1, 9]),
  soup("soup-brokolicovy-krem", "Brokolicový krém se smaženým hráškem", "VEGETARIAN", [1, 7]),
  soup("soup-vlockova", "Vločková", "VEGETARIAN", [1, 7]),
  soup("soup-americka-kukuricna", "Americká kukuřičná polévka", "VEGETARIAN", [1, 7]),
  soup("soup-rybi-krem", "Rybí krém", "FISH", [1, 4, 7]),
  soup("soup-spenatova-s-vejcem", "Špenátová s vejcem", "VEGETARIAN", [1, 3, 7]),
  soup("soup-madarska-chlebova", "Maďarská chlebová", "VEGETARIAN", [1, 3]),
  soup("soup-bramborova-s-pohankou", "Bramborová s pohankou", "VEGETARIAN", [1, 9]),
  soup("soup-hovezi-vyvar-s-jatrovou-zavarkou", "Hovězí vývar se zeleninou a játrovou zavářkou", "BEEF", [1, 3, 9]),
  soup("soup-z-cervene-repy", "Polévka z červené řepy", "VEGETARIAN", [1]),
  soup("soup-zeleninova-s-krupicovymi-knedlicky", "Zeleninová s krupicovými knedlíčky", "VEGETARIAN", [1, 3, 7, 9]),
  soup("soup-hrachova", "Hrachová", "VEGETARIAN", [1]),
  soup("soup-kvetakova", "Květáková", "VEGETARIAN", [1, 7]),
  soup("soup-drozdova-s-vejcem", "Drožďová s vejcem", "VEGETARIAN", [1, 3, 7]),
  soup("soup-bramborova-s-jahly", "Bramborová s jáhly", "VEGETARIAN", [1, 9]),
  soup("soup-mexicka-kureci", "Mexická kuřecí polévka", "POULTRY", [1, 3, 7, 9]),
  soup("soup-krkonosske-kyselo", "Krkonošské kyselo", "VEGETARIAN", [1, 3, 7]),
  soup("soup-hraskovy-krem", "Hráškový krém", "VEGETARIAN", [1, 7]),
  soup("soup-kapustova", "Kapustová", "VEGETARIAN", [1, 7]),
  soup("soup-dynova-kremova", "Dýňová krémová", "VEGETARIAN", [1, 7]),
  soup("soup-hovezi-vyvar-s-testovinou", "Hovězí vývar se zeleninou a těstovinou", "BEEF", [1, 9]),
  soup("soup-porkova", "Pórková", "VEGETARIAN", [1, 7]),
  soup("soup-rajska-s-testovinou", "Rajská s těstovinou", "VEGETARIAN", [1]),
  soup("soup-frankfurtska", "Frankfurtská s párkem a bramborem", "PORK", [1]),
  soup("soup-kureci-vyvar-s-drobenim", "Kuřecí vývar s masem, zeleninou a drobením", "POULTRY", [1, 9]),

  // Main courses
  main("main-rybi-file-na-bazalce", "Rybí filé na bazalce", "vařené brambory", "FISH", "FISH", [4, 7]),
  main("main-milanska-smes", "Milánská směs", "těstoviny penne · rajčatový protlak, šunkový salám, česnek", "PORK", "PASTA", [1]),
  main("main-cina-z-kureciho-masa", "Čína z kuřecího masa", "dušená rýže basmati · kuřecí maso, paprika, bílé zelí, sójová omáčka", "POULTRY", "CHICKEN", [6]),
  main("main-kapustove-placicky", "Kapustové placičky", "bramborová kaše", "VEGETARIAN", "VEGETABLE", [1, 3, 7]),
  main("main-rajska-omacka-s-koulemi", "Rajská omáčka s koulemi z mletého masa", "těstoviny cavatappi", "BEEF", "BEEF", [1, 3, 7]),
  main("main-duseny-spenat", "Dušený špenát", "vařené vejce, vařené brambory", "VEGETARIAN", "EGG", [1, 3]),
  main("main-krupicova-kase", "Krupicová kaše s kakaem", "sypaná cukrem, maštěná máslem", "SWEET", "SWEET", [1, 7]),
  main("main-debrecinsky-gulas", "Debrecínský guláš", "těstoviny trotolle · vepřové maso, párek", "PORK", "STEW", [1]),
  main("main-cocka-na-kyselo", "Čočka na kyselo", "vařené vejce, smažená cibulka", "VEGETARIAN", "LEGUMES", [1, 3]),
  main("main-gratinovane-hermelinove-brambory", "Gratinované hermelínové brambory s kuřecím masem", "", "POULTRY", "CHEESE", [7]),
  main("main-siroke-nudle-s-makem", "Široké nudle s mákem", "sypané cukrem, maštěné máslem", "SWEET", "SWEET", [1, 7]),
  main("main-uzene-maso", "Uzené maso", "bramborový knedlík, dušené červené zelí", "PORK", "PORK", [1, 3]),
  main("main-kuskus-s-tunakem", "Kuskus s tuňákem a čerstvou zeleninou", "sypaný sýrem", "FISH", "FISH", [1, 4, 7]),
  main("main-rozlitany-ptacek", "Rozlítaný ptáček z vepřového masa", "dušená rýže basmati · vepřová kýta, vejce, okurka, párek, hořčice", "PORK", "PORK", [1, 3, 10]),
  main("main-segedinsky-gulas", "Segedínský guláš z vepřového masa", "houskový knedlík", "PORK", "STEW", [1, 3, 7]),
  main("main-spagety-s-cesnekovym-pestem", "Špagety s česnekovým pestem a cherry rajčaty", "", "VEGETARIAN", "PASTA", [1]),
  main("main-mexicky-fazolovy-gulas", "Mexický fazolový guláš s kuřecím masem", "pečivo", "POULTRY", "STEW", [1]),
  main("main-kvetakovy-mozecek", "Květákový mozeček s vejcem", "vařené brambory", "VEGETARIAN", "EGG", [3, 7]),
  main("main-dusena-mrkev", "Dušená mrkev na másle", "vařené brambory s pažitkou", "VEGETARIAN", "VEGETABLE", [1, 7]),
  main("main-kureci-platek-na-lecu", "Kuřecí plátek na leču", "dvoubarevná rýže", "POULTRY", "CHICKEN", [1]),
  main("main-dzuvec", "Džuveč", "rýže parboiled · vepřové maso, papriky, cibule, smetana, rajčatový protlak", "PORK", "STEW", [1, 7]),
  main("main-koprova-omacka", "Koprová omáčka", "vařené vejce, vařené brambory", "VEGETARIAN", "EGG", [1, 3, 7]),
  main("main-testovinovy-salat-s-krabim-masem", "Těstovinový salát s krabím masem a čerstvou zeleninou", "s majonézou, podává se studený", "FISH", "SALAD", [1, 2, 7]),
  main("main-bramborovy-gulas-s-uzeninou", "Bramborový guláš s uzeninou", "pečivo", "PORK", "STEW", [1]),
  main("main-kureci-kousky-na-kari", "Kuřecí kousky na kari", "rýže basmati", "POULTRY", "CHICKEN", [1, 7]),
  main("main-obalovany-kvetak", "Obalovaný květák", "vařené brambory, dip ze zakysané smetany", "VEGETARIAN", "FRIED", [1, 3, 7]),
  main("main-fazole-po-bretansku", "Fazole po bretaňsku", "vařené vejce, kyselá okurka, pečivo", "VEGETARIAN", "LEGUMES", [1, 3]),
  main("main-zahoracky-zavitek", "Záhorácký závitek", "bramborový knedlík", "PORK", "PORK", [1, 3]),
  main("main-ovesna-kase", "Ovesná kaše s kakaem", "sypaná cukrem, maštěná máslem", "SWEET", "SWEET", [1, 7]),
  main("main-veprovy-gulas", "Vepřový guláš", "těstoviny farfalle", "PORK", "STEW", [1]),
  main("main-zeleninove-rizoto", "Zeleninové rizoto", "sypané uzeným sýrem", "VEGETARIAN", "GRAIN", [7]),
  main("main-samurajska-panev", "Samurajská pánev", "vařené brambory · kuřecí maso, kuřecí játra, paprika, cibule, sladká chilli omáčka", "POULTRY", "CHICKEN", [1]),
  main("main-cervena-cocka-s-lecem", "Červená čočka s lečem a pikantní klobásou", "", "PORK", "LEGUMES", []),
  main("main-bratislavska-veprova-kyta", "Bratislavská vepřová kýta", "houskový knedlík · kořenová zelenina, okurka, hrášek, smetana", "PORK", "STEW", [1, 3, 7, 9]),
  main("main-veprova-prirodni-kotleta", "Vepřová přírodní kotleta", "dvoubarevná rýže", "PORK", "PORK", [1]),
  main("main-bramborove-dukatky", "Bramborové dukátky sypané mákem", "sypané cukrem, maštěné máslem", "SWEET", "SWEET", [1, 3, 7]),
  main("main-farfalle-s-tunakem", "Těstoviny farfalle s tuňákem, hráškem a lučinou", "", "FISH", "FISH", [1, 4, 7]),
  main("main-peceny-karbanatek", "Pečený karbanátek z vepřového mletého masa", "vařené brambory", "PORK", "PORK", [1, 3, 7]),
  main("main-pecena-ryba-na-zelenine", "Pečená ryba na zelenině", "vařené brambory · ryba, mrkev, celer, máslo", "FISH", "FISH", [4, 7, 9]),
  main("main-kureci-maso-na-zampionech", "Kuřecí maso na žampionech", "rýže basmati", "POULTRY", "CHICKEN", [1, 7]),
  main("main-salat-z-cizrny", "Salát z cizrny s balkánským sýrem", "pečivo · cizrna, ledový salát, okurka, cherry rajčata", "VEGETARIAN", "SALAD", [1, 7]),
  main("main-veprove-nudlicky-na-kari", "Vepřové nudličky na kari", "dvoubarevná rýže", "PORK", "PORK", [1, 7]),
  main("main-ryzovy-nakyp-se-svestkami", "Rýžový nákyp se švestkami", "zapečený se sněhem", "SWEET", "SWEET", [3, 7]),
  main("main-kureci-stripsy", "Kuřecí stripsy smažené", "bramborová kaše s mrkví", "POULTRY", "FRIED", [1, 3, 7]),
  main("main-sojova-bolognese", "Směs à la bolognese ze sójového masa", "těstoviny penne, sypané sýrem", "VEGETARIAN", "PASTA", [1, 6, 7]),
  main("main-bramborove-knedliky-plnene-uzenym", "Bramborové knedlíky plněné uzeným masem", "dušené červené zelí", "PORK", "PORK", [1, 3]),
  main("main-veprove-po-namornicku", "Vepřové maso po námořnicku", "těstoviny fusilli", "PORK", "STEW", [1]),
  main("main-fazolove-lusky-na-kyselo", "Fazolové lusky na kyselo se smetanou", "vařené vejce, vařené brambory", "VEGETARIAN", "VEGETABLE", [1, 3, 7]),
  main("main-dusena-michana-zelenina", "Dušená míchaná zelenina na másle", "vařené brambory s pažitkou", "VEGETARIAN", "VEGETABLE", [1, 7]),
  main("main-kureci-kousky-na-kari-s-ananasem", "Kuřecí kousky na kari s ananasem", "rýže basmati", "POULTRY", "CHICKEN", [1, 7]),
  main("main-zeleninovy-kuskus-s-olivami", "Zeleninový kuskus s olivami", "sypaný parmazánem", "VEGETARIAN", "GRAIN", [1, 7]),
  main("main-recke-biftecky", "Řecké biftečky z mletého masa", "vařené brambory s pažitkou · mleté maso, balkánský sýr, orientální koření", "BEEF", "BEEF", [1, 3, 7, 10]),
  main("main-kureci-kousky-na-susenych-rajcatech", "Kuřecí kousky na sušených rajčatech", "těstoviny fusilli", "POULTRY", "PASTA", [1]),
  main("main-zapekany-kvetak-po-holandsku", "Zapékaný květák po holandsku", "vařené brambory · květák, česnek, vejce, cibule, sýr", "VEGETARIAN", "CHEESE", [3, 7]),
  main("main-hrachova-kase", "Hrachová kaše", "vařené vejce, smažená cibulka", "VEGETARIAN", "LEGUMES", [3]),
  main("main-lasagne-bolognese", "Lasagne s boloňskou omáčkou", "sypané sýrem · mleté maso, bešamel, drcená rajčata", "BEEF", "PASTA", [1, 7]),
  main("main-veprova-panenka-na-slanine", "Vepřová panenka na anglické slanině", "rýže parboiled", "PORK", "PORK", []),
  main("main-gnocchi-v-rajcatove-omacce", "Gnocchi v rajčatové omáčce", "sypané parmazánem", "VEGETARIAN", "PASTA", [1, 7]),
];
