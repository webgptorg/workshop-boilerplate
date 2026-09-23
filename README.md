# Společný stůl

První verze aplikace pro školní jídelnu, žáka a rodiče. Next.js, React, TypeScript a SQLite (`node:sqlite`, Node.js 24+).

## Spuštění

```bash
npm ci
npm run dev
```

Otevřete http://localhost:3000. Menu lze číst bez přihlášení. Účet rodiče vzniká s párovacím kódem; zaměstnanec se připojí jednorázovou pozvánkou. Pro ukázková data a čtyři testovací účty spusťte server s `IS_DEMO_MODE=true`. V tomto režimu lze použít také vedoucí účet `admin` s heslem `admin`; další účty jsou `adam` / `adam123`, `jidelna` / `jidelna123` a `petra` / `petra123`. V běžném režimu se žádný z těchto účtů ani hesel nevytváří.

První jídelnu a jejího vedoucího založí `npm run admin -- create-canteen <název> <jméno-vedoucího> <e-mail> <heslo>`. Import jídelníčkového CSV nejprve zobrazí náhled; změny potvrďte přepínačem `--confirm`: `npm run admin -- import-diners export.csv --canteen=1 --confirm`. Import připraví HTML archy párovacích dopisů s QR kódy. CSV potřebuje sloupce pro číslo strávníka a jméno; lze dodat také třídu a typ.

Databáze zachovává předchozí SQLite data a převádí je verzovanou migrací při startu. Ukázkový jídelníček obsahuje týdny od 21. září 2026; dne 28. září je jídelna zavřená.

## Funkce

- Dva obědy na každý provozní den, vlastní ikony, polévky a podrobnosti jídel.
- Sdílený výběr dítěte pro žáka i rodiče, samostatná hodnocení a komentáře.
- Rodičovské preference a náměty; jídelna vidí jejich znění a odpovídá.
- Úpravy jídel a návrh zařazení námětu z katalogu, který jídelna před použitím schvaluje.
- Barevné role, mobilní rozhraní, klávesové ovládání dialogů, stav ukládání a chybové zprávy.

## Data a provoz

Databáze `data/spolecny-stul.sqlite` se vytváří při spuštění. Soubory databáze jsou ignorovány Gitem. Vlastní adresář nastaví `DATABASE_DIRECTORY`. Pro nasazení je nutný Node server se zapisovatelným persistentním diskem; statický export ani dočasný serverless disk nestačí. Zálohujte SQLite včetně souvisejícího WAL nebo pomocí SQLite backup. Hesla se ukládají jako `scrypt` hashe. Náhodné session, obnovovací, invitační a párovací tokeny se ukládají jako hashe; session cookie je `HttpOnly` a platí 30 dní. Rate limit chrání přihlašování, obnovu hesla, registraci a použití kódů. V developmentu a testech se e-maily tisknou do konzole; v produkci nastavte `EMAIL_WEBHOOK_URL` a `EMAIL_WEBHOOK_TOKEN` pro e-mailovou službu.

## Kontroly

```bash
npx playwright install chromium
npm run check
npm run build
```

`check` zahrnuje ESLint, TypeScript, doménové testy, produkční build a Playwright průchody. Testy používají vlastní dočasné databáze a testovací server na portu 3101. Na Linuxu lze doinstalovat prohlížeč příkazem `npx playwright install --with-deps chromium`.

## Podklady a hranice verze

[Analýza všech dodaných podkladů](docs/01-analyza.md) · [Branding manuál](docs/branding/README.md) · [Vizuální ukázky](docs/branding/index.html)

Aplikace zatím nepočítá měsíční spotřební koš ani finanční limity: chybí ověřené receptury, gramáže, ceny a počty porcí. Návrh z námětu používá pravidla přiřazení ke katalogu, nikoli AI. Alergeny jsou ilustrativní data hlavního jídla a vyžadují potvrzení jídelnou. Výběry se nepřenášejí do iCanteen. Všechny tyto hranice jsou uvedeny i v rozhraní.
