# Společný stůl — vizuální identita v1

## Předloha a logo

Originální dodaná předloha je beze změn v [reference.png](reference.png). Obsahuje kruhový symbol klíčku, tmavě zelený slovní znak „společný stůl“ a claim. Aplikace používá vlastní vektorové překreslení symbolu s textem v `components/brand.tsx`. Nejde o původní zdrojové vektorové logo; pro tisk je potřeba schválit překreslení nebo získat originál. Claim z předlohy se v produktovém rozhraní neopakuje.

[Prohlédnout vizuální manuál](index.html).

Ochranná zóna: alespoň polovina průměru kruhu ze všech stran v samostatných materiálech. V navigaci je povolena kompaktní sestava s 10px mezerou mezi znakem a názvem. Minimální velikost symbolu 32px, doporučená 43px. Slovní znak je vždy malými písmeny, včetně diakritiky. Nenatahovat, neotáčet a nepřidávat stíny nebo jiné barvy. Na fotografii nejprve použít jednolitou světlou podložku.

## Písma

Přesná rodina není v rastrové předloze uvedena. Implementace používá vizuálně příbuzný **Outfit** pro název a nadpisy a **Inter** pro obsah a ovládání. Obě rodiny podporují českou diakritiku; načítá je `next/font` a aplikace je servíruje lokálně po sestavení.

| Použití | Písmo | Velikost / řez |
| --- | --- | --- |
| Značka | Outfit | 23px / 650 |
| Nadpis stránky | Outfit | 32px / 550 |
| Nadpis sekce | Outfit | 15–23px / 500 |
| Název jídla | Inter | 12–14px / 600 |
| Formulář | Inter | 13px / 400 |

## Barvy

Barvy jsou pracovní interpretací předlohy, ne laboratorně potvrzenými originálními hodnotami. Centrální tokeny jsou v `app/globals.css`.

| Token / použití | HEX |
| --- | --- |
| Text, tmavý les | `#303F35` |
| Značka | `#344D3D` |
| Žák: akcent / světlý podklad | `#476C51` / `#EDF2E7` |
| Jídelna: akcent / světlý podklad | `#946137` / `#F6ECDF` |
| Rodič: akcent / světlý podklad | `#62658A` / `#EEEDF5` |
| Krémový podklad | `#F8F9F5` |
| Karty | `#FFFFFF` |
| Šalvějový obrys | `#A6B096` |
| Dělicí linky | `#E4E7DE` |

Role se vždy rozlišuje také textem. Vybrané jídlo má obrys, zaškrtnutí a popisek, nikoliv pouze jinou barvu. Chyby mají text; stav uložení živé oznámení. Interaktivní prvky mají viditelný stav klávesového zaměření.

## Ikony a příklady

Jídla mají samostatné vektorové ilustrace na porcelánovém talíři, v teplých přirozených barvách. Katalog obsahuje rybu, těstoviny, kuře, placičky, masové kuličky, rizoto, žampiony, čočku, kuskus a sladké dukátky. Navigační ikony jsou z Lucide, se sjednocenou linkou.

- Hlavička: symbol + název vlevo, text role vpravo.
- Jídelníček: název dne, dvě bílé karty, společná polévka pod nimi.
- Primární akce: plná barva role, bílý text, 7px zaoblení.
- Sekundární akce: světlý podklad a jemný obrys.
- Odpověď jídelny: text v odlišeném bloku, konkrétní změna, datum a důvod.

## Jazyk

Český, věcný, srozumitelný dítěti i dospělému. „Týdenní jídelníček“, „Vybrat jídlo“, „Uložit hodnocení“. Nepřidávat claimy, obecné sliby nebo opakující se popisky pod nadpisy. Neznámé údaje označit „neověřeno“ nebo „nelze vyhodnotit“. Slovo „schváleno“ nesmí automaticky znamenat právní nebo nutriční certifikaci.

Samostatný [SVG symbol](symbol.svg) odpovídá překreslení použitému v aplikaci.
