import { test, expect, type Page } from "@playwright/test";
async function login(page: Page, account: string) {
  await page.locator(".role-switch").click();
  await page.getByRole("button", { name: account, exact: true }).click();
  await page.getByRole("button", { name: "Přihlásit se", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}
test("Pupil and parent share persisted choices, staff edits and responds", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Týdenní jídelníček" }),
  ).toBeVisible();
  await login(page, "Adam · žák");
  await page
    .getByRole("button", { name: "Vybrat jídlo", exact: true })
    .first()
    .click();
  await expect(page.locator(".selected")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".selected")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Ohodnotit Pečená ryba na zelenině",
      exact: true,
    })
    .click();
  await page.getByLabel("Komentář").fill("Výborná zelenina.");
  await page.getByRole("button", { name: "Uložit hodnocení" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await login(page, "Petra · rodič");
  await expect(page.locator(".selected")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Preference dítěte", exact: true })
    .click();
  await page
    .getByLabel("Oblíbená jídla a potraviny, které dítě nejí")
    .fill("Má rád rajčata.");
  await page.getByRole("button", { name: "Uložit preference" }).click();
  await page
    .getByRole("button", { name: "Náměty na jídla", exact: true })
    .click();
  await page.getByLabel("Jaké jídlo byste zařadili?").fill("Špagety pro Adama");
  await page.getByRole("button", { name: "Poslat námět jídelně" }).click();
  await expect(
    page.getByText("Špagety pro Adama", { exact: true }),
  ).toBeVisible();
  await login(page, "Jana · jídelna");
  await expect(
    page.getByText("Má rád rajčata.", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Upravit jídlo", exact: true })
    .first()
    .click();
  await page.getByLabel("Název", { exact: true }).fill("Pečená ryba s mrkví");
  await page.getByRole("button", { name: "Uložit změny" }).click();
  await expect(
    page.getByRole("heading", { name: "Pečená ryba s mrkví" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Hodnocení", exact: true }).click();
  await expect(page.getByText("Výborná zelenina.")).toBeVisible();
  await page.getByRole("button", { name: /Náměty na jídla/ }).click();
  await page
    .getByRole("combobox", { name: "Námět", exact: true })
    .selectOption({ label: "Špagety pro Adama" });
  await page.getByRole("button", { name: "Připravit návrh" }).click();
  await expect(page.locator(".proposal")).toBeVisible();
  await page
    .getByRole("textbox", { name: "Odpověď rodiči", exact: true })
    .fill("Zařazeno na pondělí s rajčatovou omáčkou.");
  await page
    .getByRole("button", { name: "Schválit a zařadit do jídelníčku" })
    .click();
  await expect(page.locator(".proposal")).toHaveCount(0);
  await login(page, "Petra · rodič");
  await page
    .getByRole("button", { name: "Náměty na jídla", exact: true })
    .click();
  await expect(
    page.getByText("Zařazeno na pondělí s rajčatovou omáčkou."),
  ).toBeVisible();
});
test("Mobile layout, navigation, bad credentials and API authorization", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Další týden" }).click();
  await expect(page.getByText("Státní svátek")).toBeVisible();
  await page.locator(".role-switch").click();
  await page.getByLabel("Heslo", { exact: true }).fill("incorrect");
  await page.getByRole("button", { name: "Přihlásit se", exact: true }).click();
  await expect(page.locator(".error-message")).toContainText("Nesprávné");
  await page.keyboard.press("Escape");
  const RESPONSE = await request.post("/api/action", {
    headers: { origin: "http://localhost:3101" },
    data: { action: "edit", mealId: 1 },
  });
  expect(RESPONSE.status()).toBe(401);
  const CROSS_ORIGIN = await request.post("/api/action", {
    headers: { origin: "https://example.com" },
    data: { action: "login", username: "adam", password: "adam123" },
  });
  expect(CROSS_ORIGIN.status()).toBe(403);
});
