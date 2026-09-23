import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
function pairingCodes(): string[] {
  const HTML=readFileSync(join(process.env.DATABASE_DIRECTORY!,"pairing-letters-1.html"),"utf8");
  return [...HTML.matchAll(/<strong>([^<]+)<\/strong>/g)].map((match)=>match[1]);
}
async function openLogin(page:Page){await page.locator(".role-switch").click();}
async function login(page:Page,identifier:string,password:string){await openLogin(page);await page.getByLabel("E-mail nebo uživatelské jméno").fill(identifier);await page.getByLabel("Heslo",{exact:true}).fill(password);await page.getByRole("button",{name:"Přihlásit se",exact:true}).last().click();await expect(page.getByRole("dialog")).toHaveCount(0);}
test("Parents register with imported diner codes and can switch between their linked children",async({page})=>{
  const CODES=pairingCodes();expect(CODES).toHaveLength(2);
  await page.goto("/");await openLogin(page);await page.getByRole("button",{name:"Registrovat rodiče s kódem"}).click();
  await page.getByLabel("Jméno",{exact:true}).fill("Petra Nováková");await page.getByLabel("Párovací kód dítěte").fill(CODES[0]);
  await page.getByLabel("E-mail",{exact:true}).fill("petra@example.test");await page.getByLabel("Heslo",{exact:true}).fill("ParentPassword-2026!");
  await page.getByRole("button",{name:"Vytvořit účet"}).click();await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("Adam Novák",{exact:false}).first()).toBeVisible();
  await page.getByRole("button",{name:"Můj účet",exact:true}).click();
  await page.getByLabel("Přidat dítě pomocí kódu").fill(CODES[1]);await page.getByRole("button",{name:"Přidat dítě"}).click();
  await expect(page.getByRole("combobox",{name:"Vybraný strávník"})).toBeVisible();
  await expect(page.getByRole("combobox",{name:"Vybraný strávník"}).locator("option")).toHaveCount(2);
  await page.getByRole("combobox",{name:"Vybraný strávník"}).selectOption({label:"Eva Nováková · 2. A"});
  await expect(page.locator(".eyebrow")).toContainText("Eva Nováková");
  await page.locator(".logout").click();
  await login(page,"manager@example.test","TestPassword-2026!");
  await page.getByRole("button",{name:"Můj účet",exact:true}).click();
  await expect(page.getByText("Petra Nováková",{exact:true}).first()).toBeVisible();
  await expect(page.getByRole("heading",{name:"Provozní záznam"})).toBeVisible();
});
test("Anonymous visitors can read the menu and sign-in does not reveal accounts",async({page})=>{
  await page.goto("/");await expect(page.getByRole("heading",{name:"Týdenní jídelníček"})).toBeVisible();
  await page.getByLabel("Vybrat datum").fill("2026-09-21");
  await expect(page.getByText("Jídelníček k dispozici").first()).toBeVisible();
  await expect(page.getByText("Jídelníček není k dispozici").first()).toBeVisible();
  const PUBLIC_DATA=await page.evaluate(()=>fetch("/").then(async(response)=>{const HTML=await response.text();return HTML.includes('"meals":[{"id"');}));expect(PUBLIC_DATA).toBe(false);
  await page.getByLabel("Vybrat datum").fill("2026-09-22");await expect(page.getByText("Jídelníček k dispozici").first()).toBeVisible();
  await openLogin(page);await page.getByLabel("E-mail nebo uživatelské jméno").fill("unknown@example.test");await page.getByLabel("Heslo",{exact:true}).fill("WrongPassword-2026!");await page.getByRole("button",{name:"Přihlásit se",exact:true}).last().click();
  await expect(page.locator(".error-message")).toContainText("Nesprávné přihlašovací údaje");
  const RESPONSE=await page.evaluate(async()=>fetch("/api/action",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"select",mealId:1})}).then((response)=>response.status));expect(RESPONSE).toBe(401);
});
test("Logged-in users see meal details and empty dates are not described as holidays",async({page})=>{
  await page.goto("/");await login(page,"manager@example.test","TestPassword-2026!");
  await page.getByLabel("Vybrat datum").fill("2026-09-21");
  await expect(page.getByText("Testovací oběd").first()).toBeVisible();
  await page.getByLabel("Vybrat datum").fill("2026-09-28");
  await expect(page.getByText("Jídelníček není k dispozici").first()).toBeVisible();
  await expect(page.getByText("Státní svátek")).toHaveCount(0);
});

test("Pupils can choose one of two meals and submit feedback",async({page})=>{
  await page.goto("/");await page.context().addCookies([{name:"stul-session",value:"pupil-test-session",url:"http://localhost:3101",httpOnly:true,sameSite:"Lax"}]);await page.reload();
  await page.getByLabel("Vybrat datum").fill("2026-09-21");
  await expect(page.locator(".role-switch")).toContainText("Žák");
  await expect(page.locator(".meal-card")).toHaveCount(4);
  await page.getByRole("button",{name:/Vybrat jídlo/}).first().click();
  await expect(page.locator(".meal-card.selected")).toHaveCount(1);
  await page.getByRole("button",{name:/Ohodnotit/}).first().click();
  await expect(page.getByRole("dialog")).toContainText("Alergeny");
  await page.getByRole("button",{name:"5 z 5 hvězdiček"}).click();
  await page.getByLabel("Komentář").fill("Dobré a chutné.");
  await page.getByRole("button",{name:"Uložit hodnocení"}).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await page.getByLabel("Vybrat datum").fill("2026-09-21");
  await expect(page.locator(".meal-card.selected")).toHaveCount(1);
});

test("Staff can edit a meal and move a menu through approval to publication",async({page})=>{
  await page.goto("/");await login(page,"manager@example.test","TestPassword-2026!");
  await page.getByLabel("Vybrat datum").fill("2026-09-21");
  await page.getByRole("button",{name:"Upravit jídlo"}).first().click();
  await expect(page.getByRole("dialog")).toContainText("Upravit jídlo");
  await page.getByLabel("Důvod změny").fill("Oprava údajů v testu");
  await page.getByLabel("Název",{exact:true}).fill("Upravený testovací oběd");
  await page.getByRole("button",{name:"Uložit změny"}).click();
  await expect(page.getByText("Upravený testovací oběd",{exact:true})).toBeVisible();

  await page.getByLabel("Vybrat datum").fill("2026-10-12");
  await expect(page.getByRole("button",{name:"Odeslat ke schválení"})).toBeVisible();
  await page.getByRole("button",{name:"Odeslat ke schválení"}).click();
  await expect(page.getByText("Čeká na schválení")).toBeVisible();
  await page.getByRole("button",{name:"Schválit"}).click();
  await expect(page.getByText("Schváleno")).toBeVisible();
  await page.getByRole("button",{name:"Zveřejnit a otevřít výběr"}).click();
  await expect(page.getByText("Zveřejněno")).toBeVisible();
});

test("Parents manage child preferences while meal selections stay available",async({page})=>{
  const [CODE]=pairingCodes();
  await page.goto("/");await openLogin(page);await page.getByRole("button",{name:"Registrovat rodiče s kódem"}).click();
  await page.getByLabel("Jméno",{exact:true}).fill("Rodič testu");await page.getByLabel("Párovací kód dítěte").fill(CODE);
  await page.getByLabel("E-mail",{exact:true}).fill("parent-flow@example.test");await page.getByLabel("Heslo",{exact:true}).fill("ParentPassword-2026!");
  await page.getByRole("button",{name:"Vytvořit účet"}).click();
  await page.getByRole("button",{name:"Preference dítěte"}).click();
  await page.getByLabel("Oblíbená jídla a potraviny, které dítě nejí").fill("Bez ořechů");await page.getByRole("button",{name:"Uložit preference"}).click();
  await expect(page.getByText("Bez ořechů")).toBeVisible();
  await page.getByRole("button",{name:"Jídelníček"}).click();await page.getByLabel("Vybrat datum").fill("2026-09-21");
  await page.getByRole("button",{name:"Vybrat jídlo",exact:true}).nth(1).click();
  await expect(page.locator(".meal-card.selected")).toContainText("Testovací alternativa");
});
