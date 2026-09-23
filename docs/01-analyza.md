# Společný stůl — analýza a rozsah první verze


## Zdroje a závěry

Analyzovány byly oba textové soubory a text všech osmi dodaných PDF. Jde o analýzu dodaných materiálů, nikoli ověření aktuálního právního stavu.

| Dokument | Dopad na produkt |
| --- | --- |
| `00-surovy-napad.txt` | Jídelna rozhoduje; námět potřebuje odpověď a při neproveditelnosti alternativu. Chybí receptury, gramáže, ceny a provozní kapacita. |
| `stavajici_jidelnicky.txt` | Šest týdnů, společná polévka a dvě hlavní jídla. Základ malého katalogu: ryba, kari, placičky, rajská, rizoto, čočka, kuskus, bramborové dukátky. Zdroj obsahuje nekonzistentní alergenové zápisy, např. „123“; nelze jej pokládat za ověřenou alergenovou databázi. |
| `vyhlaska_107-2005-1.9.2025.pdf` | Oddělit přílohy a verze pravidel; čistá hmotnost a koeficienty surovin nejsou totéž jako nakoupená hmotnost. Spotřební koš je měsíční; samotný název pokrmu nestačí. Výběrové jídelníčky mají vlastní pravidla. |
| `vyhlaska_starsi_verze_k_diff_pravidel_107-2005-1.9.2021.pdf` | Historický podklad pro rozdíly: původní skupiny a hmotnost „jak nakoupeno“ nelze bez převodu míchat s novějšími pravidly. |
| `Jak-se-pripravit-na-novy-spotrebni-kos-krok-za-krokem.pdf` | Postupné změny, neslazené nápoje, rozdíl celkových a volných cukrů, práce se surovinami. UI uvádí vodu a neslazený čaj, nepřisuzuje názvu jídla přesné nutriční vlastnosti. |
| `Duraz-na-pestrost-jidelnicku-akvalitu-surovin-mene-cukru-a-solimetodicka-podpora.pdf` | Kvalita surovin a skladba nabídky jsou samostatné dimenze. Přehled četnosti kategorií se označuje jako pestrost nabídky, nikoli splnění spotřebního koše. |
| `MSMT-5212-2024-2-stanovisko-MZd-k-volnym-cukrum-a-tukum-spotredni-kos.pdf` | Volné tuky a cukry mají odlišný význam spodních hranic; nelze použít univerzální ukazatel „čím méně, tím lépe“. Historické stanovisko není automaticky pravidlem pro novou verzi. |
| `Prezentace_souhrn_skolni_stravovani.pdf` | Různé věkové kategorie, druhy jídel a provozy vyžadují různé normy. Prezentace obsahuje i návrhy změn; není samostatným normativním zdrojem. |
| `Inspirace-pro-zarizeni-skolniho-stravovani_3_2025.pdf` | Srozumitelný jídelníček, ikony, hodnocení a zapojení rodičů. Doporučené marketingové slogany vědomě nepřebíráme dle zadání. |
| `radce-skolni-jidelny-2.pdf` | Výdejky, skladové karty, koeficienty, jednotky a počty strávníků jsou nezbytné pro objektivní výpočet. Starší metodika slouží jako vysvětlení datových rizik. |

## Rozhodnutí

- Primární pracovní plocha je týdenní jídelníček; tři ukázkové týdny začínají 21. 9. 2026. Dne 28. 9. je v ukázce zavřeno.
- Každý provozní den má právě dva chody. Alternativa není automaticky dietní jídlo.
- Žák a rodič sdílejí výběr Adama Nováka. Hodnocení mají samostatné autorství.
- Rodič spravuje textové preference, které vidí jídelna. Nejsou automatickým filtrem pro alergie.
- Jídelna upravuje jídla, vidí hodnocení a náměty. Návrh z námětu používá jednoduché deterministické přiřazení ke katalogu. Neznámý námět nabídne náhradní recepturu s vysvětlením. Zařazení vyžaduje samostatné potvrzení a odpověď.
- SQLite ukládá uživatele, náhodné expirované relace, jídelníček, volby, hodnocení, preference a náměty. Role se kontrolují na serveru.
- Přihlášení je určeno výhradně pro veřejně popsané demo účty. Nejde o registraci reálných školních uživatelů.

## Omezení a další iterace

První verze neprovádí optimalizaci měsíce ani výpočet spotřebního koše, gramáží či cen. Nesplňuje tedy celou dlouhodobou vizi původního zápisu. Týdenní nabídka je ručně sestavený startovní katalog; návrh nahrazuje jedno jídlo ve stávajícím týdnu. Suroviny jsou ilustrativní a nejsou normovanou recepturou. Přesná procenta bez vstupních dat by byla zavádějící.

Další krok: potvrzené receptury s čistými gramážemi, verzovaný katalog pravidel, skupiny strávníků a počty porcí, cenová data a provozní omezení. Teprve poté lze počítat měsíční bilanci a odhadované varianty. Před ostrým provozem ověřit aktuální legislativu, schválit alergenovou matici, přidat správu účtů, historii revizí, termíny změn a propojení s objednávkovým systémem.

Současné výběry nejsou objednávkami iCanteen. Datum ukázky je pevně 23. 9. 2026. Není zde automatické posílání e-mailů, platební systém ani zveřejňování mimo aplikaci.
