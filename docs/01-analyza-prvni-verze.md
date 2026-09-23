# Společný stůl – analýza a rozsah první verze

## Výchozí stav

Boilerplate obsahoval pouze prezentační stránku Promptbook, ukázku knihy a plovoucí chat. Neměl účty, jídelníčky, datový model ani ukládání. Převzaté zůstávají Next.js App Router, striktní TypeScript a použitelné UI primitivy. Náhrada ukázkových komponent nezasahuje do oficiálních log Promptbook. Nová značka používá dodaný soubor `prompts/image.png` beze změny.

## Závěry z podkladů

| Podklad | Závěr pro návrh aplikace |
| --- | --- |
| `00-surovy-napad.txt` | Vedoucí jídelny rozhoduje; rodič přispívá. Námět potřebuje stav a srozumitelnou odpověď. Při nezařazení musí odpověď uvést důvod i alternativu. Chybějí receptury, gramáže, ceny a provozní kapacity. |
| `stavajici_jidelnicky.txt` | Šest týdnů, 29 výdejních dnů a 58 hlavních jídel. Každý den dvě varianty a společná polévka. V týdnu od 28. září chybí pondělní výdej. Import zachovává původní záznam každého jídla; odděluje název, přílohu a uvedené alergeny. |
| `vyhlaska_107-2005-1.9.2025.pdf` | Dodané znění má změnové pasáže a přílohy pro různé režimy; není bezpečné převést každou extrahovanou hodnotu přímo na pravidlo. Spotřeba je měsíční a závisí na věkových skupinách i výdeji. V první verzi žádný výsledek neoznačujeme za splnění vyhlášky. |
| `vyhlaska_starsi_verze_k_diff_pravidel_107-2005-1.9.2021.pdf` | Starší přílohy pracují s jinými předpoklady; nelze míchat staré a nové normy. Budoucí výpočet musí ukládat identifikátor znění a režimu, dobu účinnosti a vstupy výpočtu. |
| `Jak-se-pripravit-na-novy-spotrebni-kos-krok-za-krokem.pdf` | Postupné změny, neslazené nápoje, zelenina, zdroje bílkovin a pestrost celého oběda. Samotný název hlavního chodu nestačí k výživovému posouzení; polévka je součást kontextu dne. |
| `Duraz-na-pestrost-jidelnicku-akvalitu-surovin-mene-cukru-a-solimetodicka-podpora.pdf` | Nové normy řeší kvalitu a pestrost, nejen součty komodit. Rozlišení čisté hmotnosti od nakoupené je zásadní pro případný výpočet. |
| `MSMT-5212-2024-2-stanovisko-MZd-k-volnym-cukrum-a-tukum-spotredni-kos.pdf` | Tuk a cukr nelze vyhodnocovat identicky. Historické stanovisko je třeba přiřadit k příslušné verzi pravidel, nikoliv přenést do nové tabulky bez ověření. |
| `Inspirace-pro-zarizeni-skolniho-stravovani_3_2025.pdf` | Zapojení dětí a rodičů, konkrétní zpětná vazba a věku přiměřená komunikace. Proto jednoduché hvězdičky, volitelný komentář, přímočaré formuláře a stejné rozložení rolí. |
| `Prezentace_souhrn_skolni_stravovani.pdf` | Přehled provozních, výživových a legislativních souvislostí včetně podkladů připravovaných před novelou. Prezentační materiál není samostatným zdrojem aktuálně závazných limitů. |
| `radce-skolni-jidelny-2.pdf` | Historický metodický materiál vysvětluje skladové karty, koeficienty, skutečné počty porcí a chyby evidence včetně výběrových jídelníčků. Nelze započítat obě alternativy, jako by každý strávník snědl obě. |

Analýza vychází z dodaných dokumentů, nikoli z ověření aktuálního právního stavu. Aplikace právní ani nutriční hodnocení neprovádí.

## Implementované scénáře

- Žák: prochází týdny, vybírá nebo ruší jednu ze dvou variant, otevírá detail alergenů, hodnotí jídlo a posílá námět.
- Rodič: používá stejný výběr dítěte, spravuje preference, přidává vlastní hodnocení a náměty; čte odpovědi jídelny.
- Jídelna: upravuje název, přílohu, ikonu, alergeny a společnou polévku; vidí hodnocení obou rolí; přijímá náměty k plánování nebo odpovídá důvodem a alternativou.
- Přijetí námětu je oddělené od ruční úpravy nabídky. Rozhraní tuto skutečnost výslovně uvádí. Neexistuje automatické zveřejňování nebo odesílání do školy.
- Data jsou sdílená v lokálním úložišti jednoho prohlížeče. Profil žáka a rodiče odkazuje na jedno ukázkové dítě. Přihlášení je simulace, nikoli bezpečnostní hranice.
- Chyby čtení a zápisu úložiště se zobrazují. Při nedostupném úložišti je možná práce v paměti s jasnou informací, že změny nepřežijí zavření stránky.

## Hranice verze

Automatické sestavování receptur, generování týdne kolem námětu, měsíční optimalizace a výpočet spotřebního koše či ceny nejsou součástí této verze. Bez vstupních dat by jejich prezentace jako ověřeného výsledku odporovala zadání. Další krok potřebuje ověřený katalog receptur s čistými gramážemi, skupinami surovin a alergeny, věkové kategorie, porce, ceny a limity kuchyně. Odhadový katalog musí mít vlastní označení a nesmí nahrazovat skutečnou evidenci.

Výběr v aplikaci není objednávkou v iCanteen. Dietní vhodnost alternativ se neodvozuje z ikon ani názvů jídel. Uživatelské preference nejsou potvrzením dietního stravování. Časový rámec ukázky je září–říjen 2026.

## Ověření

`npm run check` spouští ESLint, TypeScript, testy a produkční build. Testy kontrolují úplnost importu, dvě varianty za den, unikátní identifikátory, přechod mezi měsíci, ukázkové účty a odmítání poškozených dat. Ruční kontrola v prohlížeči zahrnuje uložení výběru po reloadu, společný výběr rodiče a žáka, hodnocení viditelné jídelně, podání a zpracování námětu, editaci nabídky a preference.
