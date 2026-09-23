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
  await openLogin(page);await page.getByLabel("E-mail nebo uživatelské jméno").fill("unknown@example.test");await page.getByLabel("Heslo",{exact:true}).fill("WrongPassword-2026!");await page.getByRole("button",{name:"Přihlásit se",exact:true}).last().click();
  await expect(page.locator(".error-message")).toContainText("Nesprávné přihlašovací údaje");
  const RESPONSE=await page.evaluate(async()=>fetch("/api/action",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"select",mealId:1})}).then((response)=>response.status));expect(RESPONSE).toBe(401);
});
