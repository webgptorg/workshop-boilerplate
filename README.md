# Společný stůl

První verze aplikace pro školní jídelníček, výběr obědů, hodnocení a náměty od rodičů a žáků. Next.js, React a striktní TypeScript. Bez databáze; data se ukládají do `localStorage`.

## Spuštění

```sh
npm install
npm run dev
```

Otevřete `http://localhost:3000`. Aplikace začíná ukázkovým pohledem žáka. Kliknutím na profil přepnete účet:

| Role | Uživatelské jméno | Heslo |
| --- | --- | --- |
| Žák – Matěj Novák | `matej` | `obedy123` |
| Jídelna – Jana Veselá | `jidelna` | `varime123` |
| Rodič – Petra Nováková | `petra` | `rodina123` |

Jde o veřejné fiktivní účty, nikoli skutečné přihlašovací údaje. Přepínání rolí není produkční autentizace.

## Funkce

- Šest týdnů skutečných podkladových jídelníčků, dvě varianty a společná polévka za výdejní den.
- Ikony jídel, detail alergenů a tisk jídelníčku.
- Výběr dítěte sdílený mezi žákem a rodičem, možnost výběr změnit či zrušit.
- Hodnocení hvězdičkami a komentářem; přehled pro jídelnu.
- Náměty, rozhodnutí jídelny a vysvětlení; při odmítnutí povinná alternativa.
- Úprava jídel, příloh, ikon, alergenů a polévek jídelnou.
- Preference dítěte, odlišné barevné ladění všech rolí, responzivní rozhraní a klávesnicí ovladatelné dialogy.

Data jsou pouze v konkrétním prohlížeči. Jídelna je uvidí po přepnutí role ve stejném prohlížeči. Žádná objednávka se neposílá škole. Obnovení výchozích dat je možné odstraněním klíče `spolecny-stul:v1` v lokálním úložišti. Aktivní role je pro každé nové načtení znovu žák.

## Kontroly

```sh
npm run check
npm run build
```

`check` zahrnuje lint, striktní typovou kontrolu, doménové testy a produkční sestavení. Samostatně lze spustit `npm test`.

## Struktura

- `app/` – serverová vstupní stránka, layout a designové tokeny.
- `components/meals/` – rozhraní, role, jídelníčky, dialogy a formuláře.
- `components/ui/` – sdílené základní komponenty.
- `lib/meal-model.ts` – model, ukázkové účty, formátování a validace.
- `lib/menu-data.json` – importovaný jídelníček s původními záznamy jídel.
- `lib/use-meal-store.ts` – načítání a ukládání lokálních dat.
- `tests/` – automatické kontroly modelu a importu.
- `docs/01-analyza-prvni-verze.md` – rozbor všech dodaných podkladů a hranice verze.

Tato verze neobsahuje automatický generátor jídelníčků, výpočet spotřebního koše, cen ani ověření dietní vhodnosti. Tyto funkce vyžadují ověřené receptury, gramáže, provozní vstupy a verzovaná pravidla. Náměty lze ručně zapracovat úpravou nabídky.
