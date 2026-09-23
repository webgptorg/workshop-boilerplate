# Společný stůl

Týdenní jídelníček školní jídelny pro žáky, rodiče a jídelnu. První verze bez databáze: data zůstávají v `localStorage` prohlížeče.

Východiska jsou v [docs/00-surovy-napad.txt](docs/00-surovy-napad.txt), zadání této verze v [prompts/initial-version.md](prompts/initial-version.md).

## Spuštění

```bash
npm install
npm run dev
```

Aplikace běží na `http://localhost:3000`.

## Ukázkové účty

| Role   | Jméno          | Heslo        | Co může                                                             |
| ------ | -------------- | ------------ | ------------------------------------------------------------------- |
| Žák    | `zak`          | `zak123`     | vidí týdenní jídelníček, vybírá si Oběd 1 / Oběd 2, hodnotí jídla   |
| Jídelna| `jidelna`      | `jidelna123` | sestavuje jídelníček, upravuje katalog jídel, čte hodnocení         |
| Rodič  | `rodic`        | `rodic123`   | vidí jídelníček dítěte, vybírá za něj, nastavuje preference, hodnotí |

Účty jsou definované v [lib/users/mocked-users.ts](lib/users/mocked-users.ts).

## Co je uvnitř

- Šest týdnů jídelníčku (7. 9. – 16. 10. 2026) převzatých z reálných jídelníčků v [docs/stavajici_jidelnicky.txt](docs/stavajici_jidelnicky.txt): polévka, Oběd 1, Oběd 2 a doplněk pro každý den.
- Každé jídlo má ikonu, kategorii (vepřové, hovězí, drůbeží, ryby, bezmasé, sladké) a alergeny.
- Preference rodiče (vyloučené kategorie a alergeny) se promítají do doporučení, která z variant je pro dítě vhodnější.
- Jídelna vidí u týdne přehled pestrosti podle vyhlášky 107/2005 Sb. pro jídelníčky s výběrem.
- Tlačítko „Obnovit ukázková data" u jídelny smaže vše uložené v prohlížeči.

## Struktura

- `app/` – stránky: `/` přihlášení, `/zak`, `/jidelna`, `/rodic`
- `components/` – UI po oblastech (`auth`, `diner`, `staff`, `plan`, `meals`, `feedback`, `preferences`, `ui`)
- `hooks/` – napojení na úložiště a session
- `lib/` – doménová logika bez Reactu: `users`, `meals`, `plan`, `selections`, `feedback`, `preferences`, `storage`, `dates`, `errors`

## Kontroly

```bash
npm run check   # lint + typecheck + build
```
