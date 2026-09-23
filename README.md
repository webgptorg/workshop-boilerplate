# Společný stůl

První verze aplikace pro školní jídelnu, žáka a rodiče. Next.js, React, TypeScript a SQLite (`node:sqlite`, Node.js 24+).

## Spuštění

```bash
npm ci
npm run dev
```

Otevřete http://localhost:3000. Jídelníček je dostupný bez přihlášení; uložení změn vyžaduje účet. Přihlášení otevřete tlačítkem role vpravo nahoře.

| Role | Uživatel | Heslo |
| --- | --- | --- |
| Žák — Adam Novák | `adam` | `adam123` |
| Jídelna — Jana Veselá | `jidelna` | `jidelna123` |
| Rodič — Petra Nováková | `petra` | `petra123` |

Jde o veřejné ukázkové účty, nikoli skutečné přístupové údaje. Ukázka obsahuje tři týdny od 21. září 2026. Dne 28. září je jídelna zavřená.

## Funkce

- Dva obědy na každý provozní den, vlastní ikony, polévky a podrobnosti jídel.
- Sdílený výběr dítěte pro žáka i rodiče, samostatná hodnocení a komentáře.
- Rodičovské preference a náměty; jídelna vidí jejich znění a odpovídá.
- Úpravy jídel a návrh zařazení námětu z katalogu, který jídelna před použitím schvaluje.
- Barevné role, mobilní rozhraní, klávesové ovládání dialogů, stav ukládání a chybové zprávy.

## Data a provoz

Databáze `data/spolecny-stul.sqlite` vznikne a naplní se při prvním spuštění. Soubory databáze jsou ignorovány Gitem. Vlastní adresář nastaví `DATABASE_DIRECTORY`. Pro nasazení je nutný Node server se zapisovatelným persistentním diskem; statický export ani dočasný serverless disk nestačí. Zálohujte SQLite včetně souvisejícího WAL nebo pomocí SQLite backup.

Relace používají náhodný token a HttpOnly cookie s expirací 24 hodin. Role a vstupy ověřuje server. Pro veřejný ostrý provoz jsou potřeba reálná správa účtů, ochrana proti hádání hesel, více škol a audit revizí. Ukázková hesla jsou záměrně veřejná.

## Kontroly

```bash
npx playwright install chromium
npm run check
npm run build
```

`check` zahrnuje ESLint, TypeScript, doménové testy, produkční build a Playwright průchody rolemi i mobilní rozhraní. Testy používají vlastní dočasné databáze a produkční testovací server na portu 3101. Na Linuxu lze doinstalovat prohlížeč příkazem `npx playwright install --with-deps chromium`.

## Podklady a hranice verze

[Analýza všech dodaných podkladů](docs/01-analyza.md) · [Branding manuál](docs/branding/README.md) · [Vizuální ukázky](docs/branding/index.html)

Aplikace zatím nepočítá měsíční spotřební koš ani finanční limity: chybí ověřené receptury, gramáže, ceny a počty porcí. Návrh z námětu používá pravidla přiřazení ke katalogu, nikoli AI. Alergeny jsou ilustrativní data hlavního jídla a vyžadují potvrzení jídelnou. Výběry se nepřenášejí do iCanteen. Všechny tyto hranice jsou uvedeny i v rozhraní.
